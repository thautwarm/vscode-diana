<p align="center">
<img width="550px" src="https://raw.githubusercontent.com/thautwarm/vscode-diana/master/static/static.png"/>
</p>

# VSCode-Diana

VSCode extension for [DianaScript](https://github.com/thautwarm/DianaScript-JIT); syntax highlighting support is generated by [Typed-BNF](https://github.com/thautwarm/typed-bnf).

You can add a `sigs.diana.json` to define auto-completion for your own modules:

```json5
[ // ...
	{
        "module": "MyModule",
        "doc": "...",
        "methods": [
            {
                "name": "my_method",
				"type": "my_method : (Int) -> Int", // optional
				"doc" : "an int-to-int function" // optional
            },
			// ...
        ]
    },
	// ...
]
```
