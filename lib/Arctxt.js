
const options = [
    {   // defines radius
        name:'radius',
        identifier: 'radius-',
        defaultValue: '300px', // ideally, div width of the element or something
        extractionFunction: function ( className ) {
            
            const radiusString = className.replace(this.identifier,'');

            const radius = {};
            radius.radiusValue = parseFloat(radiusString.match(/[0-9]/gm).join(''));
            radius.radiusUnit = radiusString.match(/[a-z]/gm).join('');

            return radius
        }
    }, 
    {   // defines letter spacing
        name:'userLetterSpacing',
        identifier: 'letter-spacing-', 
        defaultValue: 0, // in deg
        extractionFunction: function ( className ){
            return parseFloat(className.replace(this.identifier,''));
        }
    }, 
    {   // defines word spacing
        name:'userWordSpacing',
        identifier: 'word-spacing-', 
        defaultValue: 0, // in deg
        extractionFunction: function ( className ){
            return parseFloat(className.replace(this.identifier,''));
        }
    },
    {   // defines if should be underneath
        name:'underneath',
        identifier: 'underneath', 
        defaultValue: false, 
        extractionFunction: function ( className ){ 
            return true;
        } 
    }, 
    {   // phase offset
        name:'offset',
        identifier: 'offset-', 
        defaultValue: 1, 
        extractionFunction: function ( className ){ 
            return parseFloat(className.replace(this.identifier,''));
        } 
    }, 
]

class Arctxt {
    constructor (DOMElement) {
        this.DOM = DOMElement;
        this.letters = DOMElement.innerHTML.split('');
    }

    // Arctxt methods
    // ==========================================================================

    // configures our defaults
    configreDefaults() {
        this.options = {};
        options.forEach(option => {
            let match = false

            this.DOM.classList.forEach(token => {
                // if there's an option in the classList, extract the value
                if (token.indexOf(option.identifier) !== -1 ) {
                    const value = option.extractionFunction(token,option.identifier);
                    this.options[option.name] = value;
                    match = true;
                }
            });

            // if no matches, set a default value
            if(!match){
                this.options[option.name] = option.defaultValue;
            }

        });
    }

    checkUnderneath(){
        if(this.options.underneath){
            this.letters.reverse();
        }
    }

    calculateWordSpacing() {
        const width = getComputedStyle(this.DOM).getPropertyValue('width').replace('px','');
        this.defaultWordSpacing = width/26;
    }

    getWidth() {
        const { radius:{ radiusValue , radiusUnit } } = this.options;
        const radius = radiusValue*2 + radiusUnit;
        return radius;
    }

    getHeight() {
        const { radius:{ radiusValue , radiusUnit } } = this.options;
        const radius = radiusValue*2 + radiusUnit;
        return radius;
    }



    // loads letter elements into the DOM
    load() {
        // create a container to hold all the letters
        const letterContainer = document.createElement('div');
        letterContainer.style.width  = this.getWidth();
        letterContainer.style.height = this.getHeight();

        // append this to the DOM
        this.DOM.append(letterContainer);

        this.letterElements = []; 

        // now append each letter to our container in the DOM
        // Keep a record of the spanElements to manipulate later
        this.letters.forEach(letter => {
            const spanEL = document.createElement('span');
            spanEL.innerText = letter;
            this.letterElements.push(spanEL);
            letterContainer.append(spanEL);
        });
    }

    // get's letter width and calculates angle step
    getCharacterDimensions() {
        this.letterElements.map( letterElement => {
            letterElement.characterWidth = parseFloat(getComputedStyle(letterElement).getPropertyValue('width').replace('px',''));
            letterElement.characterHeight = parseFloat(getComputedStyle(letterElement).getPropertyValue('height').replace('px',''));
            
            return letterElement;
        });
    }

    calculateStepAngles() {
        let totalAngle = 0;
        const radiusValue = this.options.radius.radiusValue;
        this.letterElements.map((letterElement,index) => {

            if (letterElement.innerText === ' '){
                letterElement.stepAngle = this.defaultWordSpacing + this.options.userWordSpacing;
                return letterElement 
            }

            const thisCharacterWidth  = letterElement.characterWidth;
            const thisCharacterHeight = letterElement.characterHeight;
            let nextCharacterWidth = 0;
            let nextCharacterHeight = 0;

            if (this.letterElements[index+1]) {
                nextCharacterWidth  = this.letterElements[index+1].characterWidth;
                nextCharacterHeight = this.letterElements[index+1].characterHeight;
            }
           
            const Angle1 = this.toDeg(Math.atan((thisCharacterWidth)/2 / (radiusValue-thisCharacterHeight/2)));
            const Angle2 = this.toDeg(Math.atan((nextCharacterWidth)/2 / (radiusValue-nextCharacterHeight/2)));
            const stepAngle = Angle1 + Angle2 + this.options.userLetterSpacing;

            totalAngle += stepAngle;
            letterElement.stepAngle = stepAngle;

            return letterElement;
        });

        this.totalAngle = totalAngle;
    }

    toRad(degrees) {
        return degrees*Math.PI/180;
    }

    toDeg(radians) {
        return radians*180/Math.PI;
    }

    loadArcValues(){
        const radiusValue = this.options.radius.radiusValue;
        
        // sets the user offset
        let angle = 90 + this.options.offset;
        
        // Adjusts the word to symmetrical about the vertical
        angle -= this.totalAngle/2;

        let adjust = 90;
        // Adjusts if underneath is true
        if (this.options.underneath){
            angle -= 180;
            adjust += 180;
        }

        this.letterElements.forEach((letterElement,index) => {

            const stepAngle = letterElement.stepAngle;

            letterElement.style.top  = `calc(50% - ${radiusValue * Math.sin(this.toRad(angle))}px)`;
            letterElement.style.left = `calc(50% - ${radiusValue * Math.cos(this.toRad(angle))}px)`;
            letterElement.style.transform = `translate(-50%,-50%) rotateZ(${angle-adjust}deg)`;
            angle += stepAngle;
        });
    }

    clearDOM() {
        this.DOM.innerText = '';
    }

    // executes all arctxt methods in successful build order
    activate() {
        this.configreDefaults();
        this.checkUnderneath();
        this.calculateWordSpacing();
        this.clearDOM();
        this.load()
        this.getCharacterDimensions();
        this.calculateStepAngles();
        this.loadArcValues();
    }
}
