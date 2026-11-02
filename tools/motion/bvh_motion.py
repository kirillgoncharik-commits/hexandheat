"""Dependency-free BVH parser, FK and local-quaternion loop preparation.

Column-vector convention; declared BVH channels multiply left-to-right after
the joint's OFFSET. End Sites are retained with deterministic synthetic names.
Source files are never modified. Output positions are research/preview data.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import bisect
import hashlib
import json
import math
import re


IDENTITY = (1., 0., 0., 0.)  # quaternion w,x,y,z


def vadd(a, b): return tuple(x+y for x, y in zip(a,b))
def vsub(a, b): return tuple(x-y for x, y in zip(a,b))
def vmul(a, s): return tuple(x*s for x in a)
def norm(a): return math.sqrt(sum(x*x for x in a))
def lerp(a,b,t): return tuple(x+(y-x)*t for x,y in zip(a,b))


def qmul(a,b):
    w,x,y,z=a; W,X,Y,Z=b
    return (w*W-x*X-y*Y-z*Z, w*X+x*W+y*Z-z*Y,
            w*Y-x*Z+y*W+z*X, w*Z+x*Y-y*X+z*W)


def qnorm(q):
    n=norm(q)
    if n < 1e-12: raise ValueError('Degenerate quaternion')
    return tuple(x/n for x in q)


def qconj(q): return (q[0],-q[1],-q[2],-q[3])


def qrotate(q,v):
    w,x,y,z=q
    # Equivalent to q*(0,v)*conjugate(q), for a unit quaternion.
    tx=2*(y*v[2]-z*v[1]);ty=2*(z*v[0]-x*v[2]);tz=2*(x*v[1]-y*v[0])
    return (v[0]+w*tx+y*tz-z*ty, v[1]+w*ty+z*tx-x*tz,
            v[2]+w*tz+x*ty-y*tx)


def qaxis(axis,degrees):
    h=math.radians(degrees)/2;v=[math.cos(h),0.,0.,0.]
    v['XYZ'.index(axis)+1]=math.sin(h)
    return tuple(v)


def qslerp(a,b,t):
    dot=sum(x*y for x,y in zip(a,b))
    if dot<0: b=tuple(-x for x in b);dot=-dot
    dot=max(-1,min(1,dot))
    if dot>.9995:return qnorm(lerp(a,b,t))
    theta=math.acos(dot);s=math.sin(theta)
    return tuple((math.sin((1-t)*theta)*x+math.sin(t*theta)*y)/s for x,y in zip(a,b))


@dataclass
class Joint:
    name: str
    parent: int
    offset: tuple
    channels: tuple
    channel_start: int
    end_site: bool = False


class BVH:
    def __init__(self,path):
        self.path=Path(path);self.raw=self.path.read_bytes()
        self.sha256=hashlib.sha256(self.raw).hexdigest()
        text=self.raw.decode('utf-8-sig')
        sections=re.split(r'\bMOTION\b',text,maxsplit=1)
        if len(sections)!=2:raise ValueError('Missing MOTION section')
        hierarchy,motion=sections
        tokens=re.findall(r'[^\s{}]+|[{}]',hierarchy)
        self.joints=[];self.channel_count=0;i=0
        if not tokens or tokens[0]!='HIERARCHY':raise ValueError('Missing HIERARCHY')
        i=1

        def take(expected=None):
            nonlocal i
            if i>=len(tokens):raise ValueError('Unexpected end of hierarchy')
            token=tokens[i];i+=1
            if expected is not None and token!=expected:raise ValueError(f'Expected {expected}, got {token}')
            return token

        def joint(parent):
            kind=take()
            if kind not in ('ROOT','JOINT','End'):raise ValueError(f'Unexpected joint kind {kind}')
            end=kind=='End'
            if end:
                take('Site');name=self.joints[parent].name+'__EndSite'
            else:name=take()
            if any(j.name==name for j in self.joints):raise ValueError(f'Duplicate joint {name}')
            take('{');take('OFFSET')
            offset=tuple(float(take()) for _ in range(3))
            channels=()
            if not end:
                take('CHANNELS');n=int(take());channels=tuple(take() for _ in range(n))
                if len(set(channels))!=n:raise ValueError('Duplicate channels')
                if any(c not in ('Xposition','Yposition','Zposition','Xrotation','Yrotation','Zrotation') for c in channels):raise ValueError('Unknown channel')
            index=len(self.joints)
            self.joints.append(Joint(name,parent,offset,channels,self.channel_count,end))
            self.channel_count+=len(channels)
            while i<len(tokens) and tokens[i]!='}':joint(index)
            take('}')
        joint(-1)
        if i!=len(tokens):raise ValueError('Trailing hierarchy tokens')
        header=re.match(r'\s*Frames:\s*(\d+)\s+Frame\s+Time:\s*([\d.eE+-]+)\s*\n',motion)
        if not header:raise ValueError('Invalid motion header')
        self.frame_count=int(header.group(1));self.frame_time=float(header.group(2))
        if self.frame_count<2 or self.frame_time<=0 or not math.isfinite(self.frame_time):raise ValueError('Invalid duration')
        lines=motion[header.end():].strip().splitlines()
        if len(lines)!=self.frame_count:raise ValueError('Frame count mismatch')
        self.frames=[]
        for row in lines:
            values=tuple(map(float,row.split()))
            if len(values)!=self.channel_count or not all(math.isfinite(v) for v in values):raise ValueError('Invalid frame values')
            self.frames.append(values)
        self.local_cache={}
        self.names={j.name:k for k,j in enumerate(self.joints)}
        self.named_indices=[k for k,j in enumerate(self.joints) if not j.end_site]
        self.duration=(self.frame_count-1)*self.frame_time

    def local_frame(self,index):
        if index in self.local_cache:return self.local_cache[index]
        values=self.frames[index];result=[]
        for j in self.joints:
            p=j.offset;q=IDENTITY
            # Applying each declared channel in order preserves both Euler
            # ordering and even unusual interleaved translation/rotation.
            for c,v in zip(j.channels,values[j.channel_start:j.channel_start+len(j.channels)]):
                if c.endswith('rotation'):q=qmul(q,qaxis(c[0],v))
                else:
                    t=[0.,0.,0.];t['XYZ'.index(c[0])]=v
                    p=vadd(p,qrotate(q,t))
            result.append((p,qnorm(q)))
        self.local_cache[index]=result
        return result

    def local_at(self,seconds):
        if seconds < -1e-8 or seconds > self.duration+1e-8:raise ValueError('Sample outside source')
        f=max(0,min(self.frame_count-1,seconds/self.frame_time));a=int(f);b=min(a+1,self.frame_count-1);t=f-a
        A=self.local_frame(a)
        if t<1e-10 or b==a:return A
        B=self.local_frame(b)
        return [(lerp(p,P,t),qslerp(q,Q,t)) for (p,q),(P,Q) in zip(A,B)]

    def world(self,local):
        positions=[];rotations=[]
        for j,(p,q) in zip(self.joints,local):
            if j.parent<0:positions.append(p);rotations.append(q)
            else:
                positions.append(vadd(positions[j.parent],qrotate(rotations[j.parent],p)))
                rotations.append(qmul(rotations[j.parent],q))
        return positions,rotations

    def at(self,seconds):return self.world(self.local_at(seconds))[0]

    def body_height(self):
        p=self.world(self.local_frame(0))[0]
        top=p[self.names['Head__EndSite']][1]
        bottom=min(p[self.names[n]][1] for n in ('LeftToeBase','RightToeBase'))
        height=top-bottom
        if height<=0:raise ValueError('Invalid reference body height')
        return height


def blend_locals(a,b,w):return [(lerp(p,P,w),qslerp(q,Q,w)) for (p,q),(P,Q) in zip(a,b)]
def smooth5(t):return t*t*t*(10+t*(-15+6*t))


def loop_local(bvh,start,t,crop_seconds=4.,overlap=.4,output_seconds=4.):
    """Overlap the last .4s with first .4s in local quaternion space.

    A 4s source crop yields a 3.6s natural cycle; it is played at 0.9 speed
    to produce exactly 4s. Phase zero corresponds to source start+.4s.
    At the seam, the blend returns to the same source point. Piecewise source
    interpolation can retain velocity kinks: this is not a C1 certificate.
    All child offsets/bone lengths are preserved. Foot contacts are not solved.
    """
    u=(t%output_seconds)/output_seconds*(crop_seconds-overlap)
    a=bvh.local_at(start+overlap+u)
    blend_start=crop_seconds-2*overlap
    if u<=blend_start:return a
    v=u-blend_start
    b=bvh.local_at(start+v)
    return blend_locals(a,b,smooth5(v/overlap))


def normalized_positions(bvh,positions,height):
    root=positions[0]
    return [vmul(vsub(p,root),1/height) for p in positions]


def seam_metrics(sample,indices,eps=1/120):
    a=sample(0);b=sample(4)
    va=[vmul(vsub(p,q),1/eps) for p,q in zip(sample(eps),a)]
    vb=[vmul(vsub(p,q),1/eps) for p,q in zip(b,sample(4-eps))]
    pose=[norm(vsub(a[i],b[i])) for i in indices]
    vel=[norm(vsub(va[i],vb[i])) for i in indices]
    rms=lambda x:math.sqrt(sum(v*v for v in x)/len(x))
    return dict(poseRmsBodyHeights=rms(pose),poseMaxBodyHeights=max(pose),
                velocityRmsBodyHeightsPerSecond=rms(vel),velocityMaxBodyHeightsPerSecond=max(vel),
                derivativeEstimateSeconds=eps)


def validate_math():
    import tempfile
    # A Z=90 parent rotates child's X offset to +Y. An X=90 child then
    # rotates its End Site Y offset through parent to +Z, checking order.
    fixture='''HIERARCHY
ROOT root { OFFSET 0 0 0 CHANNELS 6 Xposition Yposition Zposition Zrotation Yrotation Xrotation
JOINT child { OFFSET 1 0 0 CHANNELS 3 Xrotation Zrotation Yrotation
End Site { OFFSET 0 1 0 } } }
MOTION
Frames: 2
Frame Time: .1
0 0 0 90 0 0 90 0 0
0 0 0 90 0 0 90 0 0
'''
    p=Path(tempfile.gettempdir())/'hexheat-bvh-fixture.bvh';p.write_text(fixture)
    b=BVH(p);points=b.at(.05)
    assert norm(vsub(points[1],(0,1,0)))<1e-10,points
    assert norm(vsub(points[2],(0,1,1)))<1e-10,points
    assert norm(vsub(qrotate(qmul(qaxis('Z',90),qaxis('X',90)),(0,1,0)),(0,0,1)))<1e-10
    # SLERP must cross the +/-180 boundary on the short arc.
    mid=qslerp(qaxis('Y',170),qaxis('Y',-170),.5)
    assert norm(vsub(qrotate(mid,(0,0,1)),(0,0,-1)))<1e-10
    # A rotation before translation rotates that translation in the local frame.
    shifted=fixture.replace('CHANNELS 6 Xposition Yposition Zposition Zrotation Yrotation Xrotation','CHANNELS 6 Zrotation Xposition Yposition Zposition Yrotation Xrotation').replace('0 0 0 90 0 0 90 0 0','90 2 0 0 0 0 90 0 0')
    p.write_text(shifted);b=BVH(p)
    assert norm(vsub(b.at(0)[0],(0,2,0)))<1e-10
    return 'channel order, parent FK, End Sites, SLERP wrap and interleaved translations passed'


if __name__=='__main__': print(validate_math())
