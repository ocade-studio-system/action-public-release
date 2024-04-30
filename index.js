const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

async function run() {
  try {
    // Récupération des inputs de l'action
    const owner = core.getInput('owner');
    const repository = core.getInput('repository');
    const token = core.getInput('token'); 
    const zipFile = core.getInput('zipFile');
    const newVersion = core.getInput('version');

    // Authentification à l'API GitHub
    const octokit = github.getOctokit(token);

    // Création de la release
    const release = await octokit.rest.repos.createRelease({
      owner: owner,
      repo: repository,
      tag_name: newVersion,
      name: newVersion,
      body: `Release of version ${newVersion}`,
      draft: false,
      prerelease: false,
    });

    // Lecture du fichier ZIP pour l'upload
    const zipData = fs.readFileSync(zipFile);

    // Upload de l'asset
    const { data } = await octokit.rest.repos.uploadReleaseAsset({
      url: release.data.upload_url,
      headers: {
        'content-type': 'application/zip',
        'content-length': zipData.length
      },
      name: zipFile,
      data: zipData
    });

    console.log(`Release successfully created and asset uploaded: ${data.browser_download_url}`);
  } catch (error) {
    core.setFailed(`Action failed with error ${error}`);
  }
}

run();