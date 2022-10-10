<template>
  <slot></slot>
  <div class="touch-keyboard" v-show="showKey">
    <div class="keyboard">
      <div class="line" v-for="(line, index) in keySet" :key="index">
		<span 
			v-for="(key, index) in line"
			:key="index" 
			:class="getClassesOfKey(key)"
			v-text="getCaptionOfKey(key)"
			@click="e => clickKey(e, key)"
			:style="getKeyStyle(key)"
      		:id="`press_${key.text?.toLowerCase()}`"
		/>
      </div>
    </div>
  </div>
</template>

<script>
import config from '../v-key/settings'
import isString from "lodash/isString";
import isObject from "lodash/isObject";
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    }
  },
  mounted() {
	  this.inputElement = document.getElementById('input');
    if(this.inputElement != null) {
      this.inputElement.addEventListener("focus", (e) => {
        this.showKey = true;
      });
      this.inputElement.addEventListener("keydown", (e) => {
        if(e.getModifierState('CapsLock')){
          document.getElementById(`press_${e.key}`.toLowerCase()).classList.add("press_key_active");
          this.changeKeySet("capsed");
        }else {
          this.changeKeySet("default");
        }
        if(e.shiftKey && !e.getModifierState('CapsLock')) {
          this.changeKeySet("shifted");
        }
        if(e.shiftKey && e.getModifierState('CapsLock')) {
          this.changeKeySet("default");
        }
        if (e.key === "Escape") {
          this.showKey = false;
          this.inputElement.blur();
        } else {
          const element = document.getElementById(`press_${e.key == " " ? 'space' : e.key}`.toLowerCase());
          if(element) {
            element.classList.add("press_key_active");
          }
        }
      });
      this.inputElement.focus();
    }

	this.inputElement.addEventListener("keyup", (e) => {
		const element = document.getElementById(`press_${e.key == " " ? 'space' : e.key}`.toLowerCase());
    if(e.getModifierState('CapsLock') && e.key == 'CapsLock') {
      element = undefined;
    }
    if(!e.shiftKey && !e.getModifierState('CapsLock')){
      this.changeKeySet("default");
      element.classList.remove("press_key_active");
    }
		if(element)
		  element.classList.remove("press_key_active");
	});
  },
  computed: {
    keySet() {
      if (!config) return;
      
      let configs = config['configs'];
      let keySet = configs[this.currentKeySet] || {};
      let meta = configs["_meta"] || {};
      let res = [];     

      keySet.forEach((line) => {
        let row = [];
        line.split(" ").forEach((item) => {
          if (isObject(item)) {
            row.push(item);
          }
          else if (isString(item)) {
            if (item.length > 2 && item[0] == "{" && item[item.length- 1] == "}") {
              let name = item.substring(1, item.length - 1);
              if (meta[name])
                row.push(meta[name]);
              else
                console.warn("Missing named key from meta: " + name);
            } else {
              if (item == "") {
                // Placeholder
                row.push({
                  placeholder: true
                });
                
              } else {
                // Normal key
                row.push({
                  key: item,
                  text: item
                });
              }
            }
          }
        });
        res.push(row);
      });

      return res;
    }			
  },
  data () {
  	return {
      currentKeySet: 'default',
      inputElement: null,
      showKey: true,
	};
  },
  methods: {
	changeKeySet(name) {
		if (config['configs'][name] != null)
			this.currentKeySet = name;
	},

	toggleKeySet(name) {
		this.currentKeySet = this.currentKeySet == name ? "default" : name;
	},

	getCaptionOfKey(key) {
		return key.text || key.key || "";
	},

	getClassesOfKey(key) {
    let classes = "key " + (key.func || "") + " " + (key.classes || "");
    if (key.keySet && this.currentKeySet == key.keySet)
      classes += " activated";

    return classes;
	},

	getKeyStyle(key) {
		if (key.width) 
			return {
				flex: key.width
			};
	},

	getCaret() {
    let pos = {
      start: this.inputElement.selectionStart || 0,
      end: this.inputElement.selectionEnd || 0
    };

    if (pos.end < pos.start)
      pos.end = pos.start;

    return pos;
	},

	backspace(caret, text) {
		if (caret.start < caret.end) {
			text = text.substring(0, caret.start) + text.substring(caret.end);
		} else {
			text = text.substring(0, caret.start - 1) + text.substring(caret.start);
			caret.start -= 1;
		}
		caret.end = caret.start;
		return text;
	},

	insertChar(caret, text, ch) {
		if (caret.start < caret.end) {
			text = text.substring(0, caret.start)  + ch.toString() + text.substring(caret.end);
		} else {
			text = text.substr(0, caret.start) + ch.toString() + text.substr(caret.start);
		}
		caret.start += ch.length;
		caret.end = caret.start;
		return text;
	},

	clickKey(e, key) {
		if (!this.inputElement) return;

		let caret = this.getCaret();
		let text = this.inputElement.value;
		
		let addChar = null;
		if (typeof key == "object") {
			if (key.keySet) {
				this.toggleKeySet(key.keySet);
			}else if (key.func) {
				switch(key.func) {

					case "backspace": {
						text = this.backspace(caret, text);
						break;
					}
					case "close": {
						this.showKey = false;
						return;
					}
				}
			} else {
				addChar = key.key;
			}

		} else {
			addChar = key;
		}

		if (addChar) {
			if (this.inputElement.maxLength <= 0 || text.length < this.inputElement.maxLength) {
        let e = document.createEvent("Event"); 
        e.initEvent("keydown", true, true);
        e.which = e.keyCode = addChar.charCodeAt();
        if (this.inputElement.dispatchEvent(e)) {
          text = this.insertChar(caret, text, addChar);
        }
			} 

			if (this.currentKeySet == "shifted")
				this.changeKeySet("default");
		}

		this.inputElement.value = text;
		this.setFocusToInput(caret);

		// trigger 'input' Event
		this.inputElement.dispatchEvent(new Event("input", { bubbles: true }));

	},

	setFocusToInput(caret) {
		this.inputElement.focus();
    this.inputElement.selectionStart = caret.start;
    this.inputElement.selectionEnd = caret.end;
	}
	},
}
</script>


<style lang="scss">
	$width: 40;
	$height: 2.2em;
	$margin: 0.5em;
	$radius: 0.35em;
  .press_key_active {
    transform: scale(.98);
    color: #fff;
    background-color: #5bc0de !important;
		border-color: #46b8da !important;
  }
	.touch-keyboard {
    position: fixed;
    bottom: 0px;
    right: 0px;
    left: 0px;
		.keyboard {
			width: 100%;
			margin: 0;
			
			.line {
				display: flex;
				justify-content: space-around;    
				&:not(:last-child) {
					margin-bottom: $margin;
				}
			}
			
			.key {
				&:not(:last-child) {
					margin-right: $margin;
				}

				flex: $width;
				height: $height;
				line-height: $height;
				overflow: hidden;

				vertical-align: middle;
				border: 1px solid #ccc;
				color: #333;
				background-color: #fff;
				box-shadow: 0px 2px 2px rgba(0, 0, 0, .6);
				border-radius: $radius;

				font-size: 1.25em;
				text-align: center;
				white-space: nowrap;
				user-select: none;
				cursor: pointer;
				&.half {
					flex: calc($width / 2);
				}

				&.control {
					color: #fff;
					background-color: #7d7d7d;
					border-color: #656565;
				}
							
				&.featured {
					color: #fff;
					background-color: #337ab7;
					border-color: #2e6da4;
				}

				&:hover {
					color: #333;
					background-color: #d6d6d6;
					border-color: #adadad;
				}
				
				&:active {
					transform: scale(.98); // translateY(1px);
					color: #333;
          background-color: #5bc0de !important;
		      border-color: #46b8da !important;		
				}

        &.activated {
					color: #fff;
					background-color: #5bc0de;
					border-color: #46b8da;
				}

			} // .key
			
			
			&:before,
			&:after {
				content: "";
				display: table;
			}
			&:after {
				clear: both;
			}  
		} // .keyboard

	} // .vue-touch-keyboard
</style>
