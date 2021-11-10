from pathlib import Path
from jinja2 import Environment
from jinja2.loaders import BaseLoader
from pathlib import Path
import requests
import json

req = requests.get(r"https://raw.githubusercontent.com/thautwarm/DianaScript-JIT/master/sigs-for-builtin-modules.json")
if req.status_code != 200:
	raise IOError("cannot read json spec from remote repo")

SPEC = json.loads(req.text)

env = Environment(
    loader = BaseLoader(),
    extensions=['jinja2.ext.do'],
    trim_blocks=True,
    lstrip_blocks=True
)

def find_paths(p: Path):
    if not p.is_dir():
        if p.suffix == ".in":
            yield p
    else:
        for i in p.iterdir():
            if i == p:
                continue
            yield from find_paths(i)


py_map = {
    'Tuple': 'tuple',
    'string': 'str'
}



env.filters['each'] = lambda f: lambda seq: map(f, seq)

def assert_(x):
    assert x

import builtins

namespace = {**builtins.__dict__, **globals()}
for FROM, TO in [
    (path, path.with_suffix("")) for path in find_paths(Path(__file__).parent.parent)
]:
    try:
        template = env.from_string(FROM.open(encoding='utf8').read())
        s = template.render(**namespace)
        TO.open('w', encoding='utf8').write(s)
        print(TO, "written")
    except:
        print("error ocurred at", FROM)
        raise