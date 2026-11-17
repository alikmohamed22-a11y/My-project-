import sys,json,subprocess,numpy as np
from faster_whisper import WhisperModel
src,out=sys.argv[1],sys.argv[2]
raw=subprocess.run(['ffmpeg','-loglevel','error','-i',src,'-f','s16le','-ac','1','-ar','16000','-'],capture_output=True).stdout
a=np.frombuffer(raw,np.int16).astype(np.float32)/32768
m=WhisperModel('small.en',device='cpu',compute_type='int8')
segs,_=m.transcribe(a,word_timestamps=True,beam_size=5)
W=[{'w':w.word.strip(),'s':round(w.start,3),'e':round(w.end,3)} for s in segs for w in s.words]
json.dump(W,open(out,'w'),indent=0)
print(' '.join(x['w'] for x in W))
