export namespace auth {
	
	export class Friend {
	    ID: string;
	    Name: string;
	    Mood: string;
	
	    static createFrom(source: any = {}) {
	        return new Friend(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Name = source["Name"];
	        this.Mood = source["Mood"];
	    }
	}
	export class FriendRequest {
	    id: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new FriendRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	    }
	}
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

