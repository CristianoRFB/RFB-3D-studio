import {describe,expect,it} from 'vitest';
import {createTriangleGLB} from '../src/fixture-glb';
import {ensureCapacity,validateLocalModel,MAX_LIBRARY_BYTES,MAX_LOCAL_MODELS,type LocalModel} from '../src/local-models';

function model(id='fixture-1'): LocalModel {
  return {id,name:'triangle.glb',bytes:createTriangleGLB().buffer as ArrayBuffer,meshCount:99,savedAt:1};
}
describe('local GLB library safety',()=>{
  it('revalidates geometry and derives the mesh count',()=>{
    expect(validateLocalModel(model()).meshCount).toBe(1);
    expect(()=>validateLocalModel({...model(),id:'../../bad'})).toThrow();
    expect(()=>validateLocalModel({...model(),bytes:new ArrayBuffer(10)})).toThrow();
  });
  it('allows replacement but denies exceeding six files or 24 MB',()=>{
    const full=Array.from({length:MAX_LOCAL_MODELS},(_,i)=>model('fixture-'+i));
    expect(()=>ensureCapacity(full,model('fixture-1'))).not.toThrow();
    expect(()=>ensureCapacity(full,model('fixture-9'))).toThrow(/Biblioteca cheia/);
    const large={id:'large',bytes:new ArrayBuffer(MAX_LIBRARY_BYTES)};
    expect(()=>ensureCapacity([large],model())).toThrow(/Biblioteca cheia/);
  });
});
