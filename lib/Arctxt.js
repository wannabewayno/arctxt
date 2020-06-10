
const classOptions = [
    {   // defines radius
        name:'radius',
        identifier: 'radius-',
        defaultValue: '300px', // ideally, div width of the element or something
        extractionFunction: ( className, identifier ) => {
            const radiusString = className.replace(identifier,'');

            const radius = {};
            radius.radiusValue = parseFloat(radiusString.match(/[0-9]/gm).join(''));
            radius.radiusUnit = radiusString.match(/[a-z]/gm).join('');

            return radius
        }
    }, 
    {   // defines letter spacing
        name:'letterSpacing',
        identifier: 'letter-spacing-', 
        defaultValue: 0, // ideally, the nominal letter spacing for this font size
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
            return parseFloat(className.replace(identifier,''));
        } 
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
    // stores calibration information to determine step size
    create() {
        this.containers = this.letters.map(letter => {
            const container = {};
            const spanEl = document.createElement("span");
            spanEl.innerHTML = letter;

            // calibration: a bit tidious... open to suggestions
            // =================================================
            // we give it an id: A handle to manipulate it with
            spanEl.setAttribute('id','calibration');

            // append it to the target so the DOM computes it's size
            this.DOM.append(spanEl)

            // use our handle to reference this computed element
            const calibrationContainer = document.getElementById('calibration');

            //find the computed width
            const characterWidth = parseFloat(window.getComputedStyle(calibrationContainer).getPropertyValue('width').replace('px',''));

            // find the computed height
            const characterHeight = parseFloat(window.getComputedStyle(calibrationContainer).getPropertyValue('height').replace('px',''));

            // remove it from the DOM
            calibrationContainer.remove();
            
            // remove the calibration id flag
            spanEl.setAttribute('id','');

            // store these values
            container.container = spanEl;
            container.characterWidth = characterWidth;
            container.characterHeight = characterHeight;

            return container;
        });
    }

    // calculates step size for each letter to load into our container elements
    calculate() {
        const { radius:{ radiusValue, radiusUnit }, letterSpacing, wordSpacing } = this.options;
        
        let totalAngle = 0;
        // we need to go through each container and assign custom styles
        this.containers = this.containers.map( containerObject => {
            
            const { container, characterWidth, characterHeight } = containerObject;
            const containerOptions = {};

            // * Set the letter spacing
            const stepAngle = Math.atan(characterWidth/(radiusValue-characterHeight)*2)*180/(Math.PI*2);
            const adjustedStep = stepAngle+letterSpacing;
            let step = adjustedStep;

            // * Set the word spacing 
            if (container.innerText === ' '){
                step *= wordSpacing;
            }

            totalAngle += step;

            // save the step
            containerOptions.step = step;

            // * Set the radius
            container.style.width = (radiusValue*2)+radiusUnit;
            container.style.height = (radiusValue*2)+radiusUnit;

            // save the container with the appropriate units
            containerOptions.container = container;

            return containerOptions;
        });

        // add these to our options
        this.options.totalAngle = totalAngle;
    }

    // using options, calculates how the elements should be positioned
    load() {
        const { spaceCount, totalAngle, offset } = this.options;

        let angle = 0;
        console.log(totalAngle);

        // * Set the offset
        angle += offset;

        // * this sets the text to be center about 0 degrees
        angle -= totalAngle/2;

        
        // ======================================================================
        // load our options
        this.containers.forEach(containerOption => {
            const { container, step } = containerOption;
            container.style.transform = `rotateZ(${angle}deg)`;
            angle += step;
        });
    }

    // renders the processed text
    display() {
        this.DOM.innerText =''
        this.DOM.append( ...this.containers.map(containerObj => containerObj.container) );
    }

    // executes all arctxt methods in successful build order
    activate() {
        this.configureDefaults();
        this.configureOptions();
        this.create();
        this.calculate();
        this.load();
        this.display();
    }
}


//TODO: change it from a box model to a point box with weighting on the top and bottom absolute controls


// * Set the letter spacing
// const fontSize = parseFloat(window.getComputedStyle(this.DOM).getPropertyValue('font-size').replace('px',''));
// const ballParkCharacterWidth = fontSize*0.4593;
// const radiusN = parseFloat(radius.replace('px',''));
// const stepAngle = Math.atan(ballParkCharacterWidth/radiusN*2)*180/(Math.PI*2);
// const adjustedStep = stepAngle+letterSpacing;
// let step = adjustedStep;