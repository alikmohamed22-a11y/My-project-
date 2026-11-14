# faster-whisper small.en word timestamps -> ../work/words_takeN.json
import json, sys
from faster_whisper import WhisperModel
m = WhisperModel('small.en', device='cpu', compute_type='int8')
for t in sys.argv[1:]:
    import subprocess, numpy as np
    a = np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f'take{t}_t.wav','-ar','16000','-ac','1','-f','f32le','-'],capture_output=True).stdout, np.float32)
    segs, _ = m.transcribe(a, word_timestamps=True, initial_prompt='Niagara Falls, Annie Edson Taylor, Horseshoe Falls, schoolteacher, anvil, nineteen-oh-one.')
    W = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
    json.dump(W, open(f'../work/words_take{t}.json', 'w'), indent=0); print(t, len(W), ' '.join(w['w'] for w in W))
