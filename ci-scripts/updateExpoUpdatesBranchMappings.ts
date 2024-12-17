// processChannels.js

import {exec} from 'child_process';

import fs from 'fs';

import axios from 'axios';

// Function to execute a shell command and return it as a Promise
const execCommand = (cmd: string) => {
  return new Promise((resolve, reject) => {
    exec(cmd, {maxBuffer: 1024 * 1024 * 10}, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}\nStderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
};

interface ChannelViewResponse {
  currentPage: {
    id: string;
    isPaused: boolean;
    name: string;
    updatedAt: string;
    createdAt: string;
    branchMapping: string; // It returns a JSON string, and not a JSON object
    updateBranches: any[]; // Not using it for now. No need to define the structure.
  };
}

interface BranchMappingItem {
  branchId: string;
  branchMappingLogic:
    | {
        operand: string;
        clientKey: string;
        branchMappingOperator: string;
      }
    | string;
}

interface BranchMapping {
  version: number;
  data: BranchMappingItem[];
}

interface BranchViewResponse {
  name: string;
  id: string;
  currentPage: any[]; // Not using it for now. No need to define the structure.
}

const EXPO_UPDATES_CHANNEL = 'titoflowmanual';

// Main async function
const main = async () => {
  try {
    console.log('Running updateExpoUpdatesBranchMappings');
    const EXPO_UPDATES_BRANCH = process.env.EXPO_UPDATES_BRANCH;
    if (!EXPO_UPDATES_BRANCH) {
      throw new Error('EXPO_UPDATES_BRANCH environment variable is not set.');
    }

    console.log('Fetching EAS CHANNEL...');
    const channelJsonString = (await execCommand(
      `eas channel:view ${EXPO_UPDATES_CHANNEL} test --json --non-interactive`,
    )) as string;

    const channelData: ChannelViewResponse = JSON.parse(channelJsonString);
    console.log('Channel fetched successfully.', channelData.currentPage.id);

    const channelBranchMapping: BranchMapping = JSON.parse(
      channelData.currentPage.branchMapping,
    );
    console.log(
      'Channel branch mapping:',
      JSON.stringify(channelBranchMapping, null, 2),
    );

    console.log('Fetching expo updates branch...');
    const branchJsonString = (await execCommand(
      `eas branch:view ${EXPO_UPDATES_BRANCH} --json --non-interactive`,
    )) as string;

    const branchData: BranchViewResponse = JSON.parse(branchJsonString);

    console.log(
      'Branch fetched successfully.',
      JSON.stringify(branchData, null, 2),
    );

    // Modify the branch mapping
    channelBranchMapping.data.unshift({
      branchId: branchData.id,
      branchMappingLogic: {
        clientKey: 'branch-override',
        branchMappingOperator: '==',
        operand: EXPO_UPDATES_BRANCH,
      },
    });

    // TODO - Submit graphql request to update the branch mapping
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1); // Exit with failure
  }
};

main();
