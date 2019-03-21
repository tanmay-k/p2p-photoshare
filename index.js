var profilePhoto;
var userArchive ;

var uploadImage = function(event)	{
	if( event.target.files )	{
		const {files} = event.target;
		profilePhoto = files[0];
		//document.querySelector('#change-dp-modal').style.display = 'block';
		var tempImg = document.querySelector('#temp-profile');

		var reader = new FileReader()
		reader.onload = function()	{
			var dataURL = reader.result;
			tempImg.src=dataURL;
		};
		reader.readAsDataURL(files[0]);
	}
};

var uploadProfilePhoto = function(event)	{
	document.querySelector('#change-dp-modal').style.display='none';
	var avatar = document.querySelector('#avatar-img');
	var img = document.querySelector('#temp-profile');
	avatar.src = img.src;
};

var cancelImage = function()	{
	document.querySelector('#change-dp-modal').style.display='none';
};

var createSite = async function()	{
	var userName = document.querySelector('#user-name').value
	var aboutUser = document.querySelector('#about-user').value;
	var publicKeyOfTemplate = await DatArchive.resolveName('dat://p2p-usertemplate.hashbase.io');
	var templateURL = `dat://${publicKeyOfTemplate}`;

	try {
		userArchive = await DatArchive.fork(templateURL, {
	  		title: 'P2p-Photo Share user: ' + userName,
	  		description: 'Your personal Image Sharing Portal on dat protocol',
	  		prompt: true
		});

		var curTime = Date.now().toString();
		const reader = new FileReader()
		if( typeof profilePhoto !== 'undefined' )	{
			var avatarImg = getNameAndExtension(profilePhoto.name);
			var targetPath = `/avatar.${avatarImg[1]}`;

			reader.onload = async function()	{
				await userArchive.unlink('avatar.png');	//Delete default profile photo
				await userArchive.writeFile(targetPath,reader.result);	//write user's photo
			};
			reader.readAsArrayBuffer(profilePhoto);

			//Write profile.json to user's site

			var profile = {
				'name': userName,
				'about': aboutUser,
				'avatar': targetPath,
				'createdAt': curTime
			};
		}
		else{
			//alert("Using default image!")
			var profile = {
				'name': userName,
				'about': aboutUser,
				'avatar': 'avatar.png',
				'createdAt': curTime
			};
		}

		prof = JSON.stringify(profile);
		await userArchive.writeFile('/profile.json',prof);

		await userArchive.unlink('/posts/albums/.empty');
		await userArchive.unlink('/posts/images/.empty');
	} catch (e) {
		console.log(e);
	} finally {
	}

	setTimeout(function(){window.location = userArchive.url;},500);
};

var getNameAndExtension = function(fileName)	{
	extn = fileName.split('.');
	return extn;
}

document.querySelector('input[type="file"]').addEventListener('change', uploadImage);
document.querySelector('#acceptBtn').addEventListener('click',uploadProfilePhoto);
document.querySelector('#cancelBtn').addEventListener('click',cancelImage);
document.querySelector('#createSiteBtn').addEventListener('click',createSite);
