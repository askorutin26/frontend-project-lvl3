const parseRSS = (xml) => {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(xml, 'text/xml');

  const titleElem = doc.querySelector('title');
  const title = titleElem.textContent;
  const descriptionElem = doc.querySelector('description');
  const description = descriptionElem.textContent;

  const posts = Array.from(doc.querySelectorAll('item'));

  const postElems = posts.map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postLink = post.querySelector('link').textContent;
    const postDescription = post.querySelector('description').textContent;
    return {
      title: postTitle,
      link: postLink,
      description: postDescription,
    };
  });

  return {
    title,
    description,
    postElems,
  };
};
export default parseRSS;
