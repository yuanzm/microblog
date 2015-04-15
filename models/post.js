var mongodb = require('./db');

/*
 * 集合`posts`的文档`Post`构造函数
 * @param {String} username: 发言人的名字
 * @param {String} post: 发言内容
 * @param {String} time: 发言时间
 */
function Post(username,post,time) {
	this.user = username;
	this.post = post;

	if(time) {
		this.time = time;
	} else {
		this.time = new Date();
	}
};

module.exports = Post;

/*
 * 保存一条发言到数据库
 * @param {Function} callback: 执行完数据库操作的应该执行的回调函数
 */
Post.prototype.save = function save(callback) {
	var post = {
		user: this.user,
		post: this.post,
		time: this.time,
	};
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.insert(post, {safe: true}, function(err, post) {
				mongodb.close();
				callback(err, post);
			});
		});
	});
};

/*
 * 查询一个用户的所有发言
 * @param {String} username: 需要查询的用户的名字 
 * @param {Function} callback: 执行完数据库操作的应该执行的回调函数
 */
Post.get = function get(username, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}

		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if (username) {
				query.user = username;
			}
			collection.find(query).sort({time: -1}).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					callback(err, null);
				}

				var posts = [];
				docs.forEach(function(doc, index) {
					var post = new Post(doc.user, doc.post, doc.time);
					posts.push(post);
				});
				callback(null, posts);
			});
		});
	});
};