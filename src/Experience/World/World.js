
// All the visible stuff will be here inside and Wrold folder and we will instantiate that stuff here inside World class.

import Floor from "./Floor";


export default class World {
    constructor(){
        
        this.floor = new Floor()
    }
}