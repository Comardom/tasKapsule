export namespace main {
	
	export class Capsule {
	    id: number;
	    createdAt: string;
	    contentText: string;
	    audioPath?: string;
	    attachmentPaths?: string;
	    classification: string;
	    isWithSchedule: number;
	    scheduleIcon?: string;
	    scheduleContentText?: string;
	    scheduleStartAt?: string;
	    scheduleEndAt?: string;
	    scheduleStatus?: string;
	    scheduleDeadline?: string;
	    alarmClocks?: string;
	
	    static createFrom(source: any = {}) {
	        return new Capsule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = source["createdAt"];
	        this.contentText = source["contentText"];
	        this.audioPath = source["audioPath"];
	        this.attachmentPaths = source["attachmentPaths"];
	        this.classification = source["classification"];
	        this.isWithSchedule = source["isWithSchedule"];
	        this.scheduleIcon = source["scheduleIcon"];
	        this.scheduleContentText = source["scheduleContentText"];
	        this.scheduleStartAt = source["scheduleStartAt"];
	        this.scheduleEndAt = source["scheduleEndAt"];
	        this.scheduleStatus = source["scheduleStatus"];
	        this.scheduleDeadline = source["scheduleDeadline"];
	        this.alarmClocks = source["alarmClocks"];
	    }
	}
	export class CapsulesResponse {
	    data: Capsule[];
	    total: number;
	    page: number;
	    perPage: number;
	
	    static createFrom(source: any = {}) {
	        return new CapsulesResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = this.convertValues(source["data"], Capsule);
	        this.total = source["total"];
	        this.page = source["page"];
	        this.perPage = source["perPage"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

