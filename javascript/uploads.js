let addToList;
window.onload = async function () {
  const list = document.getElementById("uploads-list");
  addToList = list.appendChild.bind(list);
  const uploads = await fetchVideos();
};
  
async function fetchVideo() {
  const response = await fetch(`/api/videos`, {method: 'GET'});
  return response.json();
}
  
function fetchVideos() {
  return fetchVideo().then(videos => {
    videos.map(video => {
      //add list item to list of videos
      addToList(toListItem(video));
      
    })
  })
}
  
function toListItem(video) {
  const listItem = document.createElement("li");  
  listItem.className = "list-group-item";

  //create the list item of the video
  listItem.innerHTML = video.stream !== null
    ? `<video width="852" height="480" controls>
        <source src="/uploads/${video.videoName}" type="video/mp4">
        <track label="English" kind="subtitles" srclang="en" src="/uploads/${video.subTitleName}" default>
        </video> <br/>

    Video: ${video.videoName} <br/> 
    SubTitle: ${video.subTitleName} <br/> 
    Public: ${video.isPublic==1? "Yes" : "No"} <br/>  
    <button class="btn btn-primary mt-1" onclick="makeVideoPublic('${video.videoName}')">Toggle Public</button> <br/> 
    <button class="btn btn-danger my-1" onclick="deleteVideo('${video.videoName}')">Delete</button>`
    : "null";
  return listItem;
}

// call API for video to toggle public status
function makeVideoPublic(videoName) {
  fetch(`/api/videos?videoName=${videoName}`, {method: 'PATCH'}).then(() => {
    window.location.reload();
  })
}

// call API for deleting the video and subtitle
function deleteVideo(videoName) {
  fetch(`/api/videos?videoName=${videoName}`, {method: 'DELETE'}).then(() => {
    window.location.reload();
  })
}