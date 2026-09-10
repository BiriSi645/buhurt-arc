import pg from 'pg';
import crypto from 'node:crypto';
let pool, initialized=false;
const db=()=>pool||=new pg.Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.NODE_ENV==='production'?{rejectUnauthorized:false}:undefined,max:3});
async function init(){if(initialized)return;await db().query(`CREATE TABLE IF NOT EXISTS buhurt_progress (sync_hash TEXT PRIMARY KEY,progress JSONB NOT NULL DEFAULT '{}'::jsonb,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);initialized=true}
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
export default async function handler(req,res){
 if(!process.env.DATABASE_URL)return res.status(503).json({error:'Database henüz bağlanmadı'});
 const code=String(req.headers['x-sync-code']||'').trim().toUpperCase();
 if(!/^[A-Z0-9-]{8,40}$/.test(code))return res.status(400).json({error:'Geçersiz senkronizasyon kodu'});
 try{await init();const id=hash(code);
  if(req.method==='GET'){const {rows}=await db().query('SELECT progress,updated_at FROM buhurt_progress WHERE sync_hash=$1',[id]);return res.status(200).json(rows[0]||{progress:null})}
  if(req.method==='PUT'){const progress=req.body?.progress;if(!progress||typeof progress!=='object')return res.status(400).json({error:'Geçersiz veri'});await db().query(`INSERT INTO buhurt_progress(sync_hash,progress) VALUES($1,$2) ON CONFLICT(sync_hash) DO UPDATE SET progress=EXCLUDED.progress,updated_at=NOW()`,[id,progress]);return res.status(200).json({ok:true})}
  res.setHeader('Allow','GET, PUT');return res.status(405).end();
 }catch(e){console.error(e);return res.status(500).json({error:'Database bağlantı hatası'})}
}
