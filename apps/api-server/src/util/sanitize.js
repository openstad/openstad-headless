var sanitize = require('sanitize-html');

const removeEmojis = (text) => {
	return !!text ? text.replace(/\p{Emoji}/gu, '') : text;
};

const normalizeUnicodeText = (text: string) => {
	if (!text) return text;

	return Array.from(text).map((char: string) => {
		const codePoint = char.codePointAt(0);
		if (codePoint >= 0x1D400 && codePoint <= 0x1D7FF) {
			const isLowercase = (codePoint >= 0x1D41A && codePoint <= 0x1D433) || (codePoint >= 0x1D44E && codePoint <= 0x1D454) || (codePoint >= 0x1D456 && codePoint <= 0x1D467) || (codePoint >= 0x1D482 && codePoint <= 0x1D49B) || (codePoint >= 0x1D4B6 && codePoint <= 0x1D4B9) || (codePoint >= 0x1D4BB && codePoint <= 0x1D4BB) || (codePoint >= 0x1D4BD && codePoint <= 0x1D4C3) || (codePoint >= 0x1D4C5 && codePoint <= 0x1D4CF) || (codePoint >= 0x1D4EA && codePoint <= 0x1D503) || (codePoint >= 0x1D51E && codePoint <= 0x1D537) || (codePoint >= 0x1D552 && codePoint <= 0x1D56B) || (codePoint >= 0x1D586 && codePoint <= 0x1D59F) || (codePoint >= 0x1D5BA && codePoint <= 0x1D5D3) || (codePoint >= 0x1D5EE && codePoint <= 0x1D607) || (codePoint >= 0x1D622 && codePoint <= 0x1D63B) || (codePoint >= 0x1D656 && codePoint <= 0x1D66F) || (codePoint >= 0x1D68A && codePoint <= 0x1D6A5) || (codePoint >= 0x1D6C2 && codePoint <= 0x1D6DA) || (codePoint >= 0x1D6DC && codePoint <= 0x1D6E1) || (codePoint >= 0x1D6FC && codePoint <= 0x1D714) || (codePoint >= 0x1D716 && codePoint <= 0x1D71B) || (codePoint >= 0x1D736 && codePoint <= 0x1D74E) || (codePoint >= 0x1D750 && codePoint <= 0x1D755) || (codePoint >= 0x1D770 && codePoint <= 0x1D788) || (codePoint >= 0x1D78A && codePoint <= 0x1D78F) || (codePoint >= 0x1D7AA && codePoint <= 0x1D7C2) || (codePoint >= 0x1D7C4 && codePoint <= 0x1D7C9);
			const normalizedChar = String.fromCharCode(
				(codePoint - 0x1D400) % 26 + (isLowercase ? 97 : 65)
			);

			return normalizedChar;
		}

		return char;
	}).join('');
};

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
