# mix_d9.wav -> mix_d9_ln.wav: gain to -14 LUFS (BS.1770 integrated, dsp.integrated) + look-ahead peak cap at -1.6 dBFS, iterated
import numpy as np
from dsp import read_wav, write_wav, integrated
from mix import cap_peaks
x, _ = read_wav('mix_d9.wav')
for i in range(4):
    x = x * 10 ** ((-14.0 - integrated(x)) / 20)
    x = cap_peaks(x, 10 ** (-1.6 / 20), look=0.003, rel=0.06)
    print(i, round(integrated(x), 2), round(20 * np.log10(np.abs(x).max()), 2))
write_wav('mix_d9_ln.wav', x)
