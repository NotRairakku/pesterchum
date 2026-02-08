export namespace auth {
	
	export class UserData {
	    username: string;
	    mood: string;
	    color: string;
	
	    static createFrom(source: any = {}) {
	        return new UserData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.username = source["username"];
	        this.mood = source["mood"];
	        this.color = source["color"];
	    }
	}

}

