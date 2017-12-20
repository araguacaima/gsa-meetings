// check if an element exists in array using a comparer function
// comparer : function(currentElement)
Array.prototype.inArray = function (comparer, element) {
    for (let i = 0; i < this.length; i++) {
        if (comparer(this[i], element)) {
            return true;
        }
    }
    return false;
};

// adds an element to the array if it does not already exist using a comparer
// function
Array.prototype.pushIfNotExist = function (element, comparer) {
    if (!this.inArray(comparer, element)) {
        this.push(element);
    }
};


// adds an element to the array if it does not already exist using a comparer
// function
Array.prototype.concatIfNotExist = function (array, comparer) {
    array.forEach(element => {
        this.pushIfNotExist(element, comparer);
    });
};