const TOKEN_URL='https://oauth2.googleapis.com/token';
const DRIVE_UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
const DRIVE_FILES='https://www.googleapis.com/drive/v3/files';

export function googleDriveConfigured(){return Boolean(process.env.GOOGLE_DRIVE_CLIENT_ID&&process.env.GOOGLE_DRIVE_CLIENT_SECRET&&process.env.GOOGLE_DRIVE_REFRESH_TOKEN&&process.env.GOOGLE_DRIVE_MEDIA_ROOT_ID);}

async function accessToken(){
  if(!googleDriveConfigured())throw new Error('GOOGLE_DRIVE_NOT_CONFIGURED');
  const body=new URLSearchParams({client_id:process.env.GOOGLE_DRIVE_CLIENT_ID,client_secret:process.env.GOOGLE_DRIVE_CLIENT_SECRET,refresh_token:process.env.GOOGLE_DRIVE_REFRESH_TOKEN,grant_type:'refresh_token'});
  const response=await fetch(TOKEN_URL,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,cache:'no-store'});
  if(!response.ok)throw new Error(`GOOGLE_DRIVE_TOKEN_${response.status}`);
  const json=await response.json();if(!json.access_token)throw new Error('GOOGLE_DRIVE_TOKEN_MISSING');return json.access_token;
}

function folderFor(mediaType){
  if(mediaType==='audio')return process.env.GOOGLE_DRIVE_AUDIO_FOLDER_ID||process.env.GOOGLE_DRIVE_MEDIA_ROOT_ID;
  if(mediaType==='artwork')return process.env.GOOGLE_DRIVE_ARTWORK_FOLDER_ID||process.env.GOOGLE_DRIVE_MEDIA_ROOT_ID;
  if(mediaType==='video')return process.env.GOOGLE_DRIVE_VIDEO_FOLDER_ID||process.env.GOOGLE_DRIVE_MEDIA_ROOT_ID;
  return process.env.GOOGLE_DRIVE_IMPORT_FOLDER_ID||process.env.GOOGLE_DRIVE_MEDIA_ROOT_ID;
}

function extFromType(type='application/octet-stream'){
  if(type.includes('mpeg'))return 'mp3';if(type.includes('wav'))return 'wav';if(type.includes('mp4'))return 'mp4';if(type.includes('png'))return 'png';if(type.includes('jpeg'))return 'jpg';if(type.includes('webp'))return 'webp';return 'bin';
}

export async function copyRemoteToGoogleDrive({sourceUrl,mediaType='other',fileName,appProperties={}}){
  if(!sourceUrl)throw new Error('SOURCE_URL_REQUIRED');
  const source=await fetch(sourceUrl,{cache:'no-store'});if(!source.ok)throw new Error(`SOURCE_FETCH_${source.status}`);
  const bytes=await source.arrayBuffer();const mimeType=source.headers.get('content-type')?.split(';')[0]||'application/octet-stream';
  const name=fileName||`reggaeai-${Date.now()}.${extFromType(mimeType)}`;const token=await accessToken();
  const init=await fetch(`${DRIVE_UPLOAD}?uploadType=resumable&fields=id,name,mimeType,size,webViewLink`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':mimeType,'X-Upload-Content-Length':String(bytes.byteLength)},body:JSON.stringify({name,parents:[folderFor(mediaType)],appProperties:{reggaeai:'true',mediaType,...appProperties}}),cache:'no-store'});
  if(!init.ok)throw new Error(`GOOGLE_DRIVE_SESSION_${init.status}`);const location=init.headers.get('location');if(!location)throw new Error('GOOGLE_DRIVE_SESSION_LOCATION_MISSING');
  const upload=await fetch(location,{method:'PUT',headers:{'Content-Type':mimeType,'Content-Length':String(bytes.byteLength)},body:Buffer.from(bytes),cache:'no-store'});
  if(!upload.ok)throw new Error(`GOOGLE_DRIVE_UPLOAD_${upload.status}`);let file=await upload.json();
  if(!file.webViewLink){const meta=await fetch(`${DRIVE_FILES}/${encodeURIComponent(file.id)}?fields=id,name,mimeType,size,webViewLink`,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'});if(meta.ok)file=await meta.json();}
  return {provider:'google_drive',fileId:file.id,name:file.name||name,mimeType:file.mimeType||mimeType,bytes:Number(file.size||bytes.byteLength),webViewLink:file.webViewLink||null};
}
