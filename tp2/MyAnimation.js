export class MyAnimation{

    constructor(){
        if (this.constructor === MyAnimation) {
           throw new Error("Cannot construct Abstract instance of MyAnimation directly");
        }


    if(this.update === undefined){
        throw new TypeError('Extending class does not implement Animation.update');
    }

    if(this.apply === undefined){
        throw new TypeError('Extending class does not implement Animation.apply');
    }
}
}

