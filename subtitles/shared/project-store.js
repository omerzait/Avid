export function openProjects(factory=globalThis.indexedDB){
 return new Promise((resolve,reject)=>{if(!factory)return reject(Error('האחסון המקומי אינו זמין'));const req=factory.open('avid-subtitles-projects',1);req.onupgradeneeded=()=>{const db=req.result;db.createObjectStore('projects',{keyPath:'id'});const versions=db.createObjectStore('versions',{keyPath:'revision',autoIncrement:true});versions.createIndex('project','projectId');const media=db.createObjectStore('media',{keyPath:'key'});media.createIndex('project','projectId');db.createObjectStore('audio',{keyPath:'id'});db.createObjectStore('cache');};req.onerror=()=>reject(req.error);req.onblocked=()=>reject(Error('סגור כרטיסיות ישנות של האתר כדי להפעיל שמירה'));req.onsuccess=()=>resolve(new ProjectStore(req.result));});
}
export class ProjectStore{
 constructor(db){this.db=db;this.queue=Promise.resolve();this.last=new Map();}
 transaction(names,write=false){try{return this.db.transaction(names,write?'readwrite':'readonly',write?{durability:'strict'}:undefined);}catch(e){if(e.name!=='TypeError')throw e;return this.db.transaction(names,write?'readwrite':'readonly');}}
 run(names,write,fn){return new Promise((resolve,reject)=>{let tx;try{tx=this.transaction(names,write);const request=fn(tx);tx.oncomplete=()=>resolve(request?.result);tx.onerror=()=>reject(tx.error||Error('השמירה נכשלה'));tx.onabort=()=>reject(tx.error||Error('השמירה בוטלה'));}catch(e){reject(e);}});}
 save(project){const snapshot=structuredClone(project),signature=JSON.stringify(snapshot);const work=this.queue.catch(()=>{}).then(async()=>{if(this.last.get(snapshot.id)===signature)return;await this.run(['projects','versions'],true,tx=>{tx.objectStore('projects').put({...snapshot,updatedAt:Date.now()});tx.objectStore('versions').add({projectId:snapshot.id,savedAt:Date.now(),state:snapshot});});this.last.set(snapshot.id,signature);});this.queue=work;return work;}
 list(){return this.run(['projects'],false,tx=>tx.objectStore('projects').getAll()).then(p=>p.sort((a,b)=>b.updatedAt-a.updatedAt));}
 get(id){return this.run(['projects'],false,tx=>tx.objectStore('projects').get(id));}
 audio(id,blob){return this.run(['audio'],!!blob,tx=>blob?tx.objectStore('audio').put({id,blob}):tx.objectStore('audio').get(id));}
 media(id,name,blob){return this.run(['media'],true,tx=>tx.objectStore('media').put({key:id+':'+name+':'+globalThis.crypto.randomUUID(),projectId:id,name,blob,size:blob.size,savedAt:Date.now()}));}
 files(id){return this.run(['media'],false,tx=>tx.objectStore('media').index('project').getAll(id));}
 revisions(id){return this.run(['versions'],false,tx=>tx.objectStore('versions').index('project').getAll(id));}
 cache(key,value){return this.run(['cache'],value!==undefined,tx=>value!==undefined?tx.objectStore('cache').put(value,key):tx.objectStore('cache').get(key));}
}
