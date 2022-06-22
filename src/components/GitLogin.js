import React, { useState, useEffect } from 'react';

function GitLogin() {
  const [userName, setUserName] = useState();
  const [userToken, setUserToken] = useState();
  const [repoList, setRepoList] = useState();
  const [selectedRepo, setSelectedRepo] = useState();
  const [selectedBranch, setSelectedBranch] = useState();
  const [showRepoDetails, setShowRepoDetails] = useState();
  const [repoBranches, setRepoBranches] = useState();
  const [repoFiles, setRepoFiles] = useState();
  const [fileContent, setFileContent] = useState();

  const htmlRepoList = [];

  const authToGithub = () => {
    var myHeaders = new Headers();
    const basicValue = btoa({userName : userToken});
    myHeaders.append("Authorization", "Basic " + basicValue);
    setShowRepoDetails(false);
    setRepoBranches([]);
    setRepoFiles([]);
    setSelectedRepo(null);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("https://api.github.com/users/" + userName + "/repos", requestOptions)
        .then(response => response.text())
        .then((result) => {
            console.log(result);
            setRepoList(JSON.parse(result));
            repoList.map((repo) => {
                htmlRepoList.push(<div>
                    <p>{repo.name}</p>
                    <p>{repo.description}</p>
                    </div>);
            })
        })
        .catch(error => console.log('error', error));
  }

  const renderRepoBranches = (repo) => {
    setSelectedRepo(repo);
    var myHeaders = new Headers();
    const basicValue = btoa({userName : userToken});
    myHeaders.append("Authorization", "Basic " + basicValue);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };
    console.log("Selected repo " + repo);
    fetch("https://api.github.com/repos/" + userName + "/" + repo.name + "/branches", requestOptions)
    .then(response => response.text())
    .then((result) => {
        setShowRepoDetails(true);
        console.log(result);
        setRepoBranches(JSON.parse(result));
    })
    .catch(error => console.log('error', error));
  }

  const onBranchSelect = (value) => {
    // get the files by brnach
    var myHeaders = new Headers();
    setSelectedBranch(value);
    const basicValue = btoa({userName : userToken});
    myHeaders.append("Authorization", "Basic " + basicValue);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("https://api.github.com/repos/"+ userName +"/" + selectedRepo.name + "/git/trees/" + value + "?recursive=1", requestOptions)
        .then(response => response.text())
        .then((result) => {
            console.log(result);
            setRepoFiles(JSON.parse(result))
        })
        .catch(error => console.log('error', error));
  }

  const renderRepoFileContent = (fileName) => {
    var myHeaders = new Headers();
    const basicValue = btoa({userName : userToken});
    myHeaders.append("Authorization", "Basic " + basicValue);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("https://api.github.com/repos/" + userName + "/"+ selectedRepo.name +"/contents/" + fileName, requestOptions)
    .then(response => response.text())
    .then((result) => {
        console.log(result);
        setFileContent(JSON.parse(result))
        
    })
    .catch(error => console.log('error', error));
  }

  const goToRepoList = () => {
    setShowRepoDetails(false);
    setSelectedBranch(null);
    setFileContent(null);
    setRepoBranches([]);
    setRepoFiles([]);
    authToGithub();
  }

  return (
    <div>
      {repoList && repoList.length > 0 && !showRepoDetails && <div>
        <h2>Repositories List</h2>
        <table style={{
            "border": "1px solid lightgray",
            "width": "64%",
            "margin": "0 auto",
            "textAlign": "left"
        }}>
            <thead style={{
                "border": "1px solid lightgray",
                "backgroundColor": "aliceblue"
            }}>
                <tr>
                    <th>#</th>
                    <th>Repo Name</th>
                    <th>Description</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
            {repoList.map((repo, index) => {
                return (<tr>
                        <td>{index+1}</td>
                        <td><p>{repo.name}</p></td>
                        <td><p>{repo.description}</p></td>
                        <td><label style={{color: "blue", textDecoration: "underline", cursor: "pointer"}} onClick={() => renderRepoBranches(repo)}>Open Repo</label></td>
                </tr>);
            })}
            </tbody>
        </table>
        
      </div>}
      {(!repoList || repoList.length <= 0) && !showRepoDetails && <div style={{"marginTop": "10%"}}>
        <h3>GitHub Login</h3>
        <p>UserName</p>
        <input type="text" value={userName} onChange={(e)=> setUserName(e.target.value)}/>
        <br></br>
        <p>Password/AuthToken</p>
        <input type="password" value={userToken} onChange={(e)=> setUserToken(e.target.value)}/>
        <br></br>
        <button style={{"marginTop": "30px"}} onClick={() => authToGithub()}>Submit</button>
      </div>}
      {showRepoDetails && <div>
        <h2>Repo - {selectedRepo.name}</h2>
        <div>
            <h4>Select Branch</h4>
            <select value={selectedBranch} onChange={(e) => onBranchSelect(e.target.value)}>
                {repoBranches.length > 0 && repoBranches.map((branch) => {
                    return <option value={branch.name}>{branch.name}</option>
                })}
                <option value="none" selected>none</option>
            </select>
        </div>
        <div>
            <ul style={{"marginTop": "10px"}}>
              {repoFiles && repoFiles.tree && repoFiles.tree.length > 0 && repoFiles.tree.map((repoFiles) => {
                return <li onClick={() => renderRepoFileContent(repoFiles.path)} style={{color: "blue", textDecoration: "underline", cursor: "pointer"}}>{repoFiles.path}</li>
              })}
            </ul>
        </div>
        {fileContent && fileContent.name && <div style={{"marginTop": "20px"}}>
          <h2>File Content - {fileContent.name}</h2>
          <div><textarea rows="80" cols="100" value={atob(fileContent.content)}>
          </textarea></div>
        </div>}
        <button onClick={() => goToRepoList()}>Back</button>
      </div>}  
    </div>
  )
}

export default GitLogin;