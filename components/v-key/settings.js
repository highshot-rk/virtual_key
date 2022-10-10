export default {

	configs: {

		_meta: {
			"shiftl": { keySet: "shifted", text: "Shift", width: 100, classes: "control"},
			"shiftr": { keySet: "shifted", text: "Shift", width: 100, classes: "control"},
			"caps": { keySet: "capsed", text: "Capslock", width: 80, classes: "control"},
			"space": { key: " ", text: "Space", width: 180},
			"enter": { key: "\r\n", text: "Enter", width: 80, classes: "control"},
			"backspace": { func: "backspace", classes: "control backspace", width: 65, text: "Backspace"},
			"close": { func: "close", text: "Close", classes: "control featured"},
		},

		default: [
			"` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
			"q w e r t y u i o p [ ] \\",
			"{caps} a s d f g h j k l ; ' {enter}",
			"{shiftl} z x c v b n m , . / {shiftr}",
			"{space} {close}"
		],
		shifted: [
			"~ ! @ # $ % ^ & * ( ) _ + {backspace}",
			"Q W E R T Y U I O P { } |",
			"{caps} A S D F G H J K L : \" {enter}",
			"{shiftl} Z X C V B N M < > ? {shiftr}",
			"{space} {close}"
		],
		
		capsed: [
			"` 1 2 3 4 5 6 7 8 9 0 - = {backspace}",
			"Q W E R T Y U I O P [ ] \\",
			"{caps} A S D F G H J K L ; ' {enter}",
			"{shiftl} Z X C V B N M , . / {shiftr}", 
			"{space} {close}"
		]		
	},
};