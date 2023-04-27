const core = require('@actions/core');
const github = require('@actions/github');


// most @actions toolkit packages have async methods
async function run() {
  try {

    const owner=core.getInput('owner',{required:true});
    const repo=core.getInput('repo',{required:true});
    const token=core.getInput('token',{required:true});
    const pr_number=core.getInput('pr_number',{required:true});

    const octokit =new github.getOctokit(token); 

    const {data:changedFiles} = await octokit.rest.pulls.listFiles({  
      owner,      
      repo,
      pull_number:pr_number,      
    });     

    let diffData   = {
      additions: 0,
      deletions: 0,
      changes: 0
    };

    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number:pr_number,
      body:`
      Pull request #${pr_number} has been updated with:\n
      ## Changes
      ${diffData.changes}\n
      ## Additions
      ${diffData.additions}\n      
      ## Deletions
      ${diffData.deletions}\n
      `
    });


    diffData=changedFiles.reduce((acc,file)=>{
      acc.additions=file.additions;
      acc.deletions=file.deletions;
      acc.changes=file.changes;
      return acc;
    },diffData);

    for (const file of changedFiles) {
      const fileExtension = file.filename.split('.').pop();
      let label='';
      switch (fileExtension) {
        case 'js':
          label='JavaScript';
          break;
        case 'css':
          label='CSS';
          break;
        case 'html':
          label='HTML';
          break;
        case 'json':
          label='JSON';
          break;
        case 'md':
          label='Markdown';
          break;
        case 'yml':
          label='YAML';
          break;
        case 'xml':
          label='XML';
          break;
        case 'sh':
          label='Shell Script';
          break;
        case 'py':
          label='Python';
          break;
        case 'java':
          label='Java';
          break;
        case 'kt':
          label='Kotlin';
          break;
        case 'go':
          label='Go';
          break;
        case 'rb':
          label='Ruby';
          break;
        case 'php':
          label='PHP';
          break;
        case 'cpp':
          label='C++';
          break;
        case 'cs':
          label='C#';
          break;
        default:
          label='Unknown';
      }

      await octokit.rest.issues.addLabel({
        owner,
        repo,        
        issue_number:pr_number,
        labels:[label]
      });
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
