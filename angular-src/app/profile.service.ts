import { Injectable } from '@angular/core';
import {HttpModule,Http} from '@angular/http'

@Injectable()
export class ProfileService {
  content = "";
  tweets:TwitterProfile[]  = null;
   img:any;
  name:any;
  username:any = null;
  topSharer:any;
  domains:any[] = null;
  constructor(private _http:Http) { }
  getProfile(){
    return this._http.get("/api/profile")
  }
  getContent(){
    return this._http.get("/api/getdomains")
  }
  getTweets(){
    return this._http.get("/api/gettweets")
  }
  processTweets(callback){
            //no use of computing in host
            //fat client lol
            //console.log("update domain")
             this.getTweets().subscribe(e=>{
            if(e.text.toString()==""){
            //  console.log("try again")
              setTimeout(this.processTweets,3000)
            }else{
            //  console.log("start replace")
              //console.log("worked :",e.json())
              this.tweets = e.json();
              let domains = []
              // regex for extracting domain
              let rex =/https?:\/\/([\[\w\-\.]*\.[\w]*)/i;
              for(let i = 0 ;i< this.tweets.length;i++) {
                  for(let j = 0 ;j< this.tweets[i].urls.length;j++) {
                  let tdate = new Date(this.tweets[i].date);
                  this.tweets[i].date =tdate.getDate()+"/"+ (tdate.getMonth()+1) +"/"+ tdate.getFullYear();
                  let text = this.tweets[i].text;
                  let tarr = text.split(':')[0].split(' ')
                  if( tarr && tarr[0] == 'RT' && tarr[1][0] =='@'){
                   this.tweets[i].text = "<i class='rt'>retweeted tweet of <a href='http://www.twitter.com/"+tarr[1].substring(1)+"'>"+tarr[1]+"</a></i><br/>" + this.tweets[i].text.substring( (tarr[0] + tarr[1]).length + 2)
                  }
                  this.tweets[i].text =  this.tweets[i].text.

                  //replace each modified link with hyperlink to original external host
                  replace(
                        this.tweets[i].urls[j].url,
                        "<a href=\""+this.tweets[i].urls[j].expanded_url+"\">"+this.tweets[i].urls[j].display_url+"</a>"
                        );
                  let res = rex.exec(this.tweets[i].urls[j].expanded_url);
                  // count occurence together
                  if(domains[res[0]])
                  {
                      domains[res[0]]++;
                  }else{
                      domains[res[0]] = 1;
                  }
                
                }
              }
			  let dt = []
			  for(let i in domains){
				dt.push({name : i,value : domains[i]})
			  }
			 
			  dt.sort((a,b)=>{return b.value - a.value})
			  let len = dt.length < 10 ? dt.length: 10
        this.domains = [];
			   for(let i=0;i<len;i++){
				   
				  this.domains.push(dt[i])
			  }
            //  console.log(dt)
			  this.updateDomain(e,(e,data)=>{
				  let count = 0;
				  let user = null;
				  for(let i in data){
					  if(count < data[i].count){
						  count = data[i].count;
						  user = data[i];
					  }
				  }
				  this.topSharer = user;
		//	 console.log("top",user)
    callback()
			  })

            }
         
       })

  }


    updateDomain(tweets,callback){
		tweets = tweets.json();
        let data = []
			
            function DomainListItem(user,name,dp){
                this.count = 0;
				this.user = user;
				this.name = name;
				this.dp  = dp;
                this.domains = [];
            }
            let rex =/https?:\/\/[\[\w\-\.]*\.[\w]*/i;
            for(let i = 0 ;i< tweets.length;i++) {
                    data[tweets[i].user] =  data[tweets[i].user] || new DomainListItem(tweets[i].user,tweets[i].name,tweets[i].dp)
                    for(let j = 0 ;j< tweets[i].urls.length;j++) {
                        data[tweets[i].user].count++;
                        let tmp = rex.exec(tweets[i].urls[j].expanded_url)[0]
                        data[tweets[i].user].domains[tmp] = data[tweets[i].user].domains[tmp] || 0
                        data[tweets[i].user].domains[tmp]++;
                    }
                
            }
           return callback(null,data)
}

}

interface TwitterProfile{
  user:string,
  name:string,
  urls:Url[],
  dp:string,
  text:string,
  date:string;
}

interface Url{
  url:string,
  display_url:string,
  expanded_url:string
}

interface AuthUser{
  photos:any[],
  username:string,
  displayName:string
}