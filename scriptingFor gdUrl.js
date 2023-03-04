const url="https://drive.google.com/file/d/1JDjOW7Yp0i7qD6jXkT00XyIfN5BPQgpp/view?usp=share_link"
const elem = document.getElementById("url");
console.log(elem)

elem.value = url;

console.log(elem.value)




document.getElementsByClassName('c')[1].getElementsByTagName("button")[0].addEventListener('click', () => console.log("hello"));
document.getElementsByClassName('c')[1].getElementsByTagName("button")[0].click()