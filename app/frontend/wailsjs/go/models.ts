export namespace auth {
	
	export class UserData {
	    username: string;
	    photo: string;
	    description: string;
	    mood: string;
	    color: string;
	    birthdate: string;
	    address: string;
	
	    static createFrom(source: any = {}) {
	        return new UserData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.username = source["username"];
	        this.photo = source["photo"];
	        this.description = source["description"];
	        this.mood = source["mood"];
	        this.color = source["color"];
	        this.birthdate = source["birthdate"];
	        this.address = source["address"];
	    }
	}

}

