var sanitize = require('sanitize-html');

const removeEmojis = (text) => {
	return !!text ? text.replace(/\p{Emoji}/gu, '') : text;
};

const normalizeUnicodeText = (text) => {
	if (!text) return text;

	const unicodeMap = {
		'𝗔': 'A', '𝗕': 'B', '𝗖': 'C', '𝗗': 'D', '𝗘': 'E', '𝗙': 'F', '𝗚': 'G', '𝗛': 'H', '𝗜': 'I', '𝗝': 'J',
		'𝗞': 'K', '𝗟': 'L', '𝗠': 'M', '𝗡': 'N', '𝗢': 'O', '𝗣': 'P', '𝗤': 'Q', '𝗥': 'R', '𝗦': 'S', '𝗧': 'T',
		'𝗨': 'U', '𝗩': 'V', '𝗪': 'W', '𝗫': 'X', '𝗬': 'Y', '𝗭': 'Z',
		'𝗮': 'a', '𝗯': 'b', '𝗰': 'c', '𝗱': 'd', '𝗲': 'e', '𝗳': 'f', '𝗴': 'g', '𝗵': 'h', '𝗶': 'i', '𝗷': 'j',
		'𝗸': 'k', '𝗹': 'l', '𝗺': 'm', '𝗻': 'n', '𝗼': 'o', '𝗽': 'p', '𝗾': 'q', '𝗿': 'r', '𝘀': 's', '𝘁': 't',
		'𝘂': 'u', '𝘃': 'v', '𝘄': 'w', '𝘅': 'x', '𝘆': 'y', '𝘇': 'z',
		'𝘈': 'A', '𝘉': 'B', '𝘊': 'C', '𝘋': 'D', '𝘌': 'E', '𝘍': 'F', '𝘎': 'G', '𝘏': 'H', '𝘐': 'I', '𝘑': 'J',
		'𝘒': 'K', '𝘓': 'L', '𝘔': 'M', '𝘕': 'N', '𝘖': 'O', '𝘗': 'P', '𝘘': 'Q', '𝘙': 'R', '𝘚': 'S', '𝘛': 'T',
		'𝘜': 'U', '𝘝': 'V', '𝘞': 'W', '𝘟': 'X', '𝘠': 'Y', '𝘡': 'Z',
		'𝘢': 'a', '𝘣': 'b', '𝘤': 'c', '𝘥': 'd', '𝘦': 'e', '𝘧': 'f', '𝘨': 'g', '𝘩': 'h', '𝘪': 'i', '𝘫': 'j',
		'𝘬': 'k', '𝘭': 'l', '𝘮': 'm', '𝘯': 'n', '𝘰': 'o', '𝘱': 'p', '𝘲': 'q', '𝘳': 'r', '𝘴': 's', '𝘵': 't',
		'𝘶': 'u', '𝘷': 'v', '𝘸': 'w', '𝘹': 'x', '𝘺': 'y', '𝘻': 'z'
	};

	return text.split('').map(char => unicodeMap[char] || char).join('');
}

// Decorator for the sanitize function
// This prevents the bug where sanitize returns the string 'null' when null is passed
const sanitizeIfNotNull = (text, tags) => {
	if (text === null) {
		return null;
	}
	text = removeEmojis(text);
	text = normalizeUnicodeText(text);
	return sanitize(text, tags);
}

var remoteURL = /^(?:\/\/)|(?:\w+?:\/{0,2})/;
var noTags = {
	allowedTags       : [],
	allowedAttributes : []
};
var allSafeTags = {
	allowedTags: [
		// Content sectioning
		'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'nav', 'section',
		// Text content
		'center', 'dd', 'div', 'dl', 'dt', 'figcaption', 'figure', 'hr',
		'li', 'ol', 'p', 'pre', 'ul',
		// Inline text semantics
		'a', 'b', 'big', 'blockquote', 'br', 'cite', 'code', 'em', 'i',
		'mark', 'q', 's', 'strike', 'small', 'span', 'strong', 'sub', 'u',
		'var',
		// Demarcating edits
		'del', 'ins',
		// Image and multimedia
		'audio', 'img', 'video',
		// Table content
		'caption', 'col', 'colgroup', 'table', 'tbody', 'td', 'tfoot', 'th',
		'thead', 'tr'
	],
	allowedAttributes: {
		'*' : ['align', 'alt', 'bgcolor', 'center', 'class', 'data-*', 'name', 'title'],
		a   : ['href', 'name', 'rel', 'target'],
		img : ['height', 'src', 'width']
	},
	// allowedClasses: {
	// 	'p': [ 'fancy', 'simple' ]
	// },
	allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel'],
	transformTags: {
		a: function( tagName, attrs ) {
			if( attrs.href && remoteURL.test(attrs.href) ) {
				attrs.target = '_blank';
				attrs.rel    = 'noreferrer noopener';
			}
			return {tagName: tagName, attribs: attrs};
		},
	}
};

module.exports = {
	title: function( text ) {
		// TODO: de replace is natuurlijk belachelijk, maar ik heb nergens een combi kunnen vinden waarin sanatize en nunjucks dit fatsoenlijk oplossen. Ik denk dat de weergaven van title naar |safe moeten, want ze zijn toch gesanatized, maar daar heb ik nu geen tijd voor
		return sanitizeIfNotNull(text, noTags).replace('&amp;', '&');
	},
	summary: function( text ) {
		return sanitizeIfNotNull(text, noTags);
	},
	content: function( text ) {
		return sanitizeIfNotNull(text, allSafeTags);
	},
	
	argument: function( text ) {
		return sanitizeIfNotNull(text, noTags);
	},
	
	// TODO: Transform all call to these two options, instead
	//       of the content-type-named versions above.
	safeTags: function( text ) {
		return sanitizeIfNotNull(text, allSafeTags);
	},
	noTags: function( text ) {
		return sanitizeIfNotNull(text, noTags);
	}
};
