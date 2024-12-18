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

// Main async function
const main = async () => {
  try {
    console.log('Running updateExpoUpdatesBranchMappings');
    const EXPO_UPDATES_CHANNEL = process.env.EXPO_UPDATES_CHANNEL;
    if (!EXPO_UPDATES_CHANNEL) {
      throw new Error('EXPO_UPDATES_CHANNEL environment variable is not set.');
    }

    const EXPO_UPDATES_BRANCH = process.env.EXPO_UPDATES_BRANCH;
    if (!EXPO_UPDATES_BRANCH) {
      throw new Error('EXPO_UPDATES_BRANCH environment variable is not set.');
    }

    const EXPO_TOKEN = process.env.EXPO_TOKEN;
    if (!EXPO_TOKEN) {
      throw new Error('EXPO_TOKEN environment variable is not set.');
    }

    console.log('Fetching EAS CHANNEL...');
    const channelJsonString = (await execCommand(
      `eas channel:view ${EXPO_UPDATES_CHANNEL} --json --non-interactive`,
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

    // Existing branch override for the current branch
    const branchOverrideForCurrentBranch = channelBranchMapping.data.findIndex(
      item => {
        const isBranchOverride =
          typeof item.branchMappingLogic !== 'string' &&
          item.branchMappingLogic.clientKey === 'branch-override';

        const isCurrentBranch = item.branchId === branchData.id;

        return isBranchOverride && isCurrentBranch;
      },
    );

    // Removes existing branch override for the current branch if it exists
    if (branchOverrideForCurrentBranch > -1) {
      channelBranchMapping.data.splice(branchOverrideForCurrentBranch, 1);
    }

    // Adds a branch override for the current branch on top of the list
    channelBranchMapping.data.unshift({
      branchId: branchData.id,
      branchMappingLogic: {
        clientKey: 'branch-override',
        branchMappingOperator: '==',
        operand: EXPO_UPDATES_BRANCH,
      },
    });

    console.log(
      'Updated channel branch mapping:',
      JSON.stringify(channelBranchMapping, null, 2),
    );

    const branchMappingString = JSON.stringify(channelBranchMapping);

    const graphqlMutation = `
      mutation AddBranchMapping($channelId: ID!, $branchMapping: String!) {
        updateChannel {
          editUpdateChannel(channelId: $channelId, branchMapping: $branchMapping) {
            id
          }
        }
      }
    `;

    const result = await axios.post(
      'https://api.expo.dev/graphql',
      {
        query: graphqlMutation,
        variables: {
          channelId: channelData.currentPage.id,
          branchMapping: branchMappingString,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${EXPO_TOKEN}`,
        },
      },
    );

    // The request can return errors even with a successful status code
    // So we check for errors in the response data
    if (result.data.errors) {
      throw new Error(
        `An error occurred: ${JSON.stringify(result.data.errors, null, 2)}`,
      );
    }

    console.log(
      'Branch mapping updated successfully:',
      JSON.stringify(result.data, null, 2),
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Axios error:',
        error.response?.data ?? error.message ?? error,
      );
    } else {
      console.error('An error occurred:', error);
    }

    process.exit(1); // Exit with failure
  }
};

main();
