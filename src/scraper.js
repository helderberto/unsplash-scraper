const axios = require("axios");
const cheerio = require("cheerio");

const URL = "https://unsplash.com";

let username = null;
let userInfo = {};
let interests = [];
let photos = [];
let $ = null;

const argUsername = process.argv.slice(2)[0];

if (!argUsername) {
  throw Error(
    "Arg. username is required. Try again i.e: yarn scrap <user-example>"
  );
}

username = argUsername;

const fetchUserData = async () => {
  const profileUrl = `${URL}/@${username}`;

  console.info(`🏁 Getting data from ${profileUrl}`);
  const result = await axios.get(profileUrl);
  console.log("✅ Data collected");

  return cheerio.load(result.data);
};

const getUserName = async () => $("._3FvGs.U8wGh._2svCU._1Fli6").text();

const getInterests = async () => {
  console.info("🏁 Filling interests");
  await $("._2Krql._1pgnK._2FGz6 ._3Z-ua a._6PxCM._2SmIi").each(
    (index, element) => {
      const href = $(element).prop("href");

      const interest = {
        href: `${URL}/${href}`,
        text: $(element).text()
      };

      interests.push(interest);
    }
  );
  console.info("✅ Filled interests");
};

const getUserPhotos = async () => {
  console.info("🏁 Filling photos");
  await $("div[data-test=users-photos-route] div.nDTlD a._2Mc8_").each(
    (index, element) => {
      const $img = $(element).find("img");
      const viewUrl = `${URL}${$(element).prop("href")}`;
      let sizes = [];
      let imageSrcset = $img.prop("srcset");

      if (imageSrcset) {
        sizes = imageSrcset.split(", ");
      }

      const photo = { viewUrl };

      if (sizes.length) {
        photo.sizes = sizes;
      }

      photos.push(photo);
    }
  );
  console.info("✅ Filled photos");
};

const init = async () => {
  $ = await fetchUserData();

  userInfo.name = await getUserName();

  console.info(`🏁 Populating infos from user ${userInfo.name}`);

  await getInterests();

  if (interests.length) {
    userInfo.interests = interests;
  }

  await getUserPhotos();

  console.info(`✅ Populated infos`);

  if (photos.length) {
    userInfo.photos = photos;
  }

  console.log("USER INFO DATA:", JSON.stringify(userInfo));
};

init();
