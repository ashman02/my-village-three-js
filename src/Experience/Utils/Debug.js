import GUI from "lil-gui"
// He uses TweakPane in his latest portfolio code. I can switch to that later. 

export default class Debug {
    constructor(){
        this.active = window.location.hash === "#debug"

        if(this.active){
            this.ui = new GUI()
        }
    }
}