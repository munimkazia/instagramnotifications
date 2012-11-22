var instagramnotifications = {
	response : {},
	picdata: {},
	newphotocallback : function(photo)
	{
		console.log('new photo published: ' + photo.link);
	},
	newcommentcallback: function(photo,comment)
	{
		row = "<tr><td>"+comment.id+"</td><td>Comment</td><td>" + comment.from.full_name + "</td><td>" + photo.link + "</td><td>" + comment.text + "</td></tr>";
		$('tr.header').after(row);
	},
	newlikecallback: function(photo,like)
	{
		row = "<tr><td>"+like.id+"</td><td>Like</td><td>" + like.full_name + "</td><td>" + photo.link + "</td><td></td></tr>";
		$('tr.header').after(row);
	},
	apicallback: function(res){
		callbackqueue = [];
		if(res.meta.code==200)
		{
			for(i in res.data)
			{
				if(typeof this.picdata[res.data[i].id] === "undefined")
				{
					this.picdata[res.data[i].id] = { 
						likes: { },
						comments:{ },
						caption:res.data[i].caption,
						link:res.data[i].link
					};
					callbackqueue.push({f:this.newphotocallback,a1:this.picdata[res.data[i].id],a2:null});
				}
				photo = this.picdata[res.data[i].id];
				likequeue = [];
				commentqueue = [];
				for(j in res.data[i].likes.data)
				{
					like = res.data[i].likes.data[j];
					if(typeof photo.likes[like.id]	=== "undefined")
					{
						photo.likes[like.id] = like;
						likequeue.push({f:this.newlikecallback,a1:photo,a2:like});
					}
				}
				likequeue.reverse();
				for(x in likequeue)
					callbackqueue.push(likequeue[x]);
					
				for(j in res.data[i].comments.data)
				{
					comment = res.data[i].comments.data[j];
					if(typeof photo.comments[comment.id]	=== "undefined")
					{
						photo.comments[comment.id] = comment;
						commentqueue.push({f:this.newcommentcallback,a1:photo,a2:comment});
					}
				}
				commentqueue.reverse();
				for(x in commentqueue)
					callbackqueue.push(commentqueue[x]);
				
			}
			callbackqueue.reverse();
			for(i in callbackqueue)
			{
				f = callbackqueue[i].f;
				if(callbackqueue[i].a2==null)
					f(callbackqueue[i].a1);
				else
					f(callbackqueue[i].a1,callbackqueue[i].a2);
			}
		}
		if(typeof res.pagination.next_url !== "undefined")
			this.getnotifications(res.pagination.next_url);
	},
	init: function(options)
	{
		if(options!=null)
		{
			if(typeof options.access_token!=="undefined")
				this.response.access_token = options.access_token;
		}
		if(typeof this.response.access_token=="undefined")
		{
			hash = window.location.hash;
			hash = hash.substr(1);
			hashparts = hash.split('&');
			for(i in hashparts)
			{
				varparts = hashparts[i].split('=');
				this.response[varparts[0]] = varparts[1];
			}
		}
		
	},
	getnotifications: function(next_url)
	{
		if(next_url==null)
			url = 'https://api.instagram.com/v1/users/self/media/recent/?access_token='+this.response.access_token+'&callback=?';
		else
			url = next_url;
		$.ajax({
			type: 'GET',
			url: url,
			async: false,
			jsonpCallback: 'instagramnotifications.apicallback',
			contentType: "application/json",
			dataType: 'jsonp'
		});
	}
}
