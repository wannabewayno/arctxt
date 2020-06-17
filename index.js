window.onload = () => {
    arctxt();
}

const arctxt = () => {
    // this function will look for .arctxt classes and create a html collection
    const arctxtCollection = document.getElementsByTagName('arctxt');

    // we create an array of arctxt elements from the html collection 
    const arctxtElements = Array.from(arctxtCollection);

    // we loop over the array of arctxt elements
    // for each element create a new Arctxt instance
    // activate this instance
    arctxtElements.forEach(arctxtElement => {
        const arctxt = new Arctxt(arctxtElement);
        arctxt.activate();
    });
}