const express = require('express');
const util = require('minecraft-server-util');
const MojangAPI = require('mojang-api-js');
const canvas = require('canvas');
const Clipper = require('image-clipper');

const clipper = Clipper({
	canvas: canvas
})

const app = express();
const options = {
	timeout: 1000 * 5, // timeout in milliseconds
	enableSRV: true // SRV record lookup
};

const api_port = 3000;

const client = new MojangAPI();

async function getSkinURLByName(nickname) {
	const data = await client.playerTextures(nickname);
	return data.properties[0].textures.SKIN.url;
}

async function getCroppedImage(skinURL, x, y, w, h) {
  return new Promise(resolve => {
	clipper.loadImageFromUrl(skinURL, () => {
      clipper.crop(x, y, w, h)
		.toDataURL((dataURL) => {
			resolve(dataURL)
		})
    })
  })
}

async function getPlayerHeadByName(nickname) {
	try {
		const image_size = 16; 
		const skinURL = await getSkinURLByName(nickname);
		const layer1 = await getCroppedImage(skinURL, 8, 8, 8, 8);
		const layer2 = await getCroppedImage(skinURL, 40, 8, 8, 8);
		const cnv = canvas.createCanvas(image_size, image_size);
		const ctx = cnv.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		ctx.fillRect(0, 0, 8, 8);
		const image1 = await canvas.loadImage(layer1);
		ctx.drawImage(image1, 0, 0, image_size, image_size);
		const image2 = await canvas.loadImage(layer2);
		ctx.drawImage(image2, 0, 0, image_size, image_size);
		const dataURL = cnv.toDataURL("image/png").replace("image/png", "image/octet-stream");
		return dataURL;
	} catch (error) {
		console.error(error);
		return null;
	}
}

app.get('/minecraft_api/get', async (req, res) => {
	try {
        const minecraft_ip = req.query.ip;
        const minecraft_port = req.query.port || 25565;
        console.log(`${minecraft_ip}:${minecraft_port}`)
        const result = await util.status(minecraft_ip, parseInt(minecraft_port), options);
        res.json(result);
  	} catch (error) {
        res.status(500).send(error);
  	
	}	
});

app.get('/mojang_api/:nickname', async (req, res) => {
	try {
			const nickname = req.params.nickname;
			const dataURL = await getPlayerHeadByName(nickname);
			if (dataURL) {
				res.json({ image: dataURL });
		} else {
			res.json({ image: "data:image/octet-stream;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAJ5UExURS8gDS4gDSseDS8fDy4fDikcCycbCyQYCCUaCiYaCioeDSodDS4fDS4fDyodDCkdDCgbCjAiDzIjED0nED4oETwoEzomEi0fDigcCy0gDzoqFzwrGT4sGkQxHkYyHlA1HlE2Hk82IEw1Hz4qGDknFTwrGJlzWKd9YquAZa2CaLSIcrSHca+BaK6AZ66Caax/ZqBvVI1hRzwqFzEjEE85JriKbruMcL2Nc8OTfcKSfLqJcbqJcL2OdLuLca54XJxqT002IEIuGp10XaF2X7KCarODa62AZ62AaK+Cbq2BbaF2YKN3YbmIcLiGbqFtUZtoS5NjR5JiRqx+Z66Ba7yRfLqPfKN5baF2aqx+bKx+a6J2Yq1/c65/c6l8ZKZ5X59tUZ5sT7KCa72Tf/Ho4+Td421YkmdLgKx3a7Z+abiGb6t9c2VLhG9Zk+Pb4Orf2LCGcah6YrB+ZrqPeu/j3ePZ3nFakmpMgKNuY6t0YLB+Z6R3bWdLgXJbkeLY2+jb06yCbKN2Xp5mSaNrULiFbrmHcrB+daV0bHdLPHFGNXFGNntQP658arOBba16XKV0VIhaPIRXOZpiRZ1lSa11W693X7B7aaZyYnJGNms/MGo/MHZJOK96YLR+YqJrSZpkQoNVNoBTNJJfRJNfRJliRJdgQ4JNPX1IO3ZCNXVCNHdDNX5JO4JNPI9dP49ePoNUOYFTOItaQIxaP5BbPY1YPHtHNnhENXlENnhENotaPYtbPYFTOYBSOHJHLnFGLHNHLn5QN4BROX9ROHpNNHtONIFTOoJUO4RWO4NVOnxPNG9FLG5FLG1DKn9RN4BTOHtPNIJUOoNVO3pOM////4uCOikAAAABYktHRNLg2K6wAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH5wUIBzcFL+NkOwAAARtJREFUGNMBEAHv/gAAAQICAwQFBgcHCAkKAgsLAAEMAgINBA4PEBAFDgICCwsAAgIODg4CERITFBUWFwsYGAACGRobGxwdHh8gISIjJAIPABglJicoKSorLC0uLzAxMjMAGzQoNTY3ODk6Ozw9Pj9AQQBCQ0RFRkdISUpLTE1OT1BRAFJTVFVWV1hZSlpbXF1eX2AAYWJjZGVmZ2hpamtsbW5vcABxcnN0dXZ3eHl6e3x9fn+AAIGCg4SFhoeIiYqLjI2Oj5AAkZKTlJWWl5iZmpucnZ6foAChoqOkpaanqKipqqusra6vALCxsrO0tba3tbW1tLi5ursAvLy9vr/AwMHCw8TFxsfIwwDJysvJzLq6zc7Oz9DQz87R5KRibj4TtXkAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMDUtMDhUMDc6NTQ6MzcrMDA6MDA2mupKAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTA1LTA4VDA3OjU0OjM3KzAwOjAwR8dS9gAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyMy0wNS0wOFQwNzo1NTowNSswMDowMOYADt0AAAAASUVORK5CYII=" });
		}
	} catch (error) {
		res.status(500).send(error);
	}
});

app.listen(api_port, () => {
	console.log(`Server running on port ${api_port}`);
});
