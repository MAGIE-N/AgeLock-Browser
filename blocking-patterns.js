// Blocking patterns for AgeLock Browser
exports.adNetworks = [
  // Standard ad networks
  'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
  'adnxs.com', 'adroll.com', 'adsrvr.org', 'adtechus.com', 'amazon-adsystem.com',
  'casalemedia.com', 'criteo.com', 'demdex.net', 'facebook.com/tr/', 'google-analytics.com',
  'googletagmanager.com', 'googletagservices.com', 'mathtag.com', 'moatads.com',
  'outbrain.com', 'quantserve.com', 'rfihub.com', 'rubiconproject.com',
  'scorecardresearch.com', 'serving-sys.com', 'taboola.com', 'yieldmo.com', 'zedo.com',
  'a-ads.com', 'adsterra.com', 'propellerads.com', 'pubmine.com', 'revcontent.com',
  'mgid.com', 'adskeeper.co.uk', 'coinzilla.io', 'ezoic.net', 'media.net', 'mediavine.com'
];

exports.popupDomains = [
  // Popup ad networks
  'popads.net', 'popcash.net', 'propellerclick.com', 'popmyads.com', 'popunder.ru',
  'popundertotal.com', 'popadscdn.net', 'popclck.org', 'popclck.net', 'popmarker.com',
  'popunder.com', 'popunder.net', 'popunder.ru', 'popads.com', 'popadscdn.net',
  'popcashmedia.com'
];

exports.maliciousDomains = [
  'coffeemanga.io', 'coffeemanga.com', 'mangadex.org', 'mangakakalot.com', 
  'mangapanda.com', 'mangareader.net', 'mangafox.me', 'mangago.me', 
  'mangahere.cc', 'mangapark.net'
];

exports.trackingParams = [
  'utm_', 'fbclid=', 'gclid=', 'gclsrc=', 'dclid=', 'msclkid=', 'mc_eid=', 'mc_cid=',
  'icid=', 'igshid=', 'yclid=', '_ga=', 'campaignid=', 'adgroupid=', 'adid=',
  'ad_id=', 'bannerid=', 'campid=', 'cid=', 'cpn=', 'creative=', 'kw=', 'kwid=',
  'placement=', 'pltid=', 'ranreqid=', 'referrer=', 's_kwcid=', 'subid=', 'tag='
];

exports.suspiciousPathPatterns = [
  // Ad patterns
  /\/ads?\//i, /\/advert/i, /\/banner/i, /\/promo/i, /\/track/i, /\/affiliate/i,
  /adserver/i, /advertise/i, /advertising/i, /advertisement/i, /adtech/i, /adcontent/i,
  /adprovider/i, /ad[-_]?unit/i, /ad[-_]?container/i, /ad[-_]?wrapper/i, /ad[-_]?slot/i,
  /ad[-_]?frame/i, /ad[-_]?block/i, /ad[-_]?space/i, /sponsor/i, /recommend/i,
  
  // Popup patterns
  /popup/i, /pop[-_]?up/i, /popunder/i, /pop[-_]?under/i, /pop[-_]?out/i, /pop[-_]?in/i,
  /pop[-_]?over/i, /pop[-_]?ad/i, /pop[-_]?ads/i, /pop[-_]?advert/i, /pop[-_]?advertisement/i,
  /pop[-_]?advertising/i, /pop[-_]?adserver/i, /pop[-_]?adtech/i, /pop[-_]?adcontent/i,
  
  // Manga-specific patterns
  /manga[-_]?ads?/i, /manga[-_]?banner/i, /manga[-_]?promo/i, /manga[-_]?sponsor/i,
  /manga[-_]?recommend/i, /manga[-_]?widget/i, /manga[-_]?teaser/i, /manga[-_]?popup/i,
  /manga[-_]?overlay/i, /manga[-_]?interstitial/i, /manga[-_]?floating/i, /manga[-_]?floater/i,
  /manga[-_]?notification/i, /manga[-_]?recommendation/i, /manga[-_]?suggestion/i,
  /manga[-_]?related[-_]?content/i, /manga[-_]?similar/i, /manga[-_]?you[-_]?may[-_]?like/i,
  /manga[-_]?you[-_]?might[-_]?like/i, /manga[-_]?recommended/i, /manga[-_]?suggested/i,
  /manga[-_]?trending/i, /manga[-_]?popular/i, /manga[-_]?new/i, /manga[-_]?latest/i
];

exports.hostnamePatterns = [
  // Facebook tracking patterns
  /(^|\.)facebook\.com\/(tr|connect|plugins|beacon|extern|widgets)\//i,
  /(^|\.)fb\.com\/(tr|connect)\//i,
  /(^|\.)facebook\.net\//i,
  /(^|\.)fb\.net\//i,
  
  // Google tracking patterns
  /(^|\.)doubleclick\.net$/i,
  /(^|\.)google(syndication|adservices|tagservices|analytics)\./i,
  /(^|\.)googletag(manager|services)\./i
];
