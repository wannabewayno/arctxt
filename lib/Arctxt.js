
// list of arc text option identifiers
// has an identifier
// an extraction function
// a default value
const classOptions = [
    {   // defines radius
        name:'radius',
        identifier: 'radius-',
        defaultValue: '300px', // ideally, div width of the element or something
        extractionFunction: ( className, identifier ) => {
            return className.replace(identifier,'');
        }
    }, 
    {   // defines letter spacing
        name:'letterSpacing',
        identifier: 'letter-spacing-', 
        defaultValue: 9, // ideally, the nominal letter spacing for this font size
        extractionFunction: ( className, identifier ) => {
            return parseFloat(className.replace(identifier,''));
        }
    }, 
    {   // defines word spacing
        name:'wordSpacing',
        identifier: 'word-spacing-', 
        defaultValue: 1, // ideally, the nominal word spacing for this font 
        extractionFunction: ( className, identifier ) => {
            return parseFloat(className.replace(identifier,''));
        }
    },
    {   // defines if should be underneath
        name:'underneath',
        identifier: 'underneath', 
        defaultValue: false, 
        extractionFunction: ( className, identifier ) => { 

        } 
    }, 
    {   // phase offset
        name:'offset',
        identifier: 'offset-', 
        defaultValue: 0, 
        extractionFunction: ( className, identifier ) => { 

        } 
    }, 
    {   // if symmetrical about 0, with a specified gap
        name:'symmetrical',
        identifier: 'symmetrical-', 
        defaultValue: {
                symmetrical:true,
                gap:0
        }, 
        extractionFunction: ( className, identifier ) => { 

        }, 
    }, 
]

class Arctxt {
    constructor (DOMElement) {
        this.DOM = DOMElement;
        this.letters = DOMElement.innerHTML.split('');
        // this.default 
    }

    // Arctxt methods
    // ==========================================================================
    configureDefaults() {
        // we set the default options from the classOptions provided defaults
        this.options = {};
        classOptions.forEach(classOption => {
            this.options[classOption.name] = classOption.defaultValue;
        });
    }
    // sets up arc text options
    configureOptions() {
        // we go through the DOMElement's classList properties and see if they match arctxt options
        classOptions.forEach(classOption => {
        
            this.DOM.classList.forEach(className => {
               
                if ( className.indexOf(classOption.identifier) !== -1) {

                    //get custom property via extraction function
                    const customValue = classOption.extractionFunction( className, classOption.identifier );
                
                    // if we do have a hit then set this custom property
                    this.options[classOption.name] = customValue;
                }
            });
        });
    }

    // creates necessary elements to create arc markup
    create() {
        this.containers = this.letters.map(letter => {
           const spanEl = document.createElement("span");
           spanEl.innerHTML = letter;
           return spanEl;
        });
    }

    // using options, calculates how the elements should be positioned
    load() {
        // we need to go through each container and assign custom styles
        let angle = 0;
        let step;
        this.containers.forEach((container,index) => {
            // load our options
            const { radius, letterSpacing, wordSpacing, offset, symmetrical } = this.options;

            // * Set the radius
            container.style.width = radius;
            container.style.height = radius;

            // * Set the letter spacing
            step = letterSpacing

            // * Set the word spacing 
            if (container.innerText === ' '){
                step *= wordSpacing;
            }

            // * Set the offset
            step += offset;

            // * Set the symmetry
            if (symmetrical)

            angle += step;
            container.style.transform = `rotateZ(${angle}deg)`;
        });
        
    }

    // renders the processed text
    display() {
        this.DOM.innerText =''
        this.DOM.append(...this.containers);
    }

    // executes all arctxt methods in successful build order
    activate() {
        this.configureDefaults();
        this.configureOptions();
        this.create();
        this.load();
        this.display();
    }
}
