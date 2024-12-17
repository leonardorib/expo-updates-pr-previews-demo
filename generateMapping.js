const branchMapping = {
  data: [
    {
      branchMappingLogic: {
        clientKey: 'branch-override',
        branchMappingOperator: '==',
        operand: 'test-1',
      },
      branchId: '50bdc148-9404-44b2-b787-917de223bbd2',
    },
    {
      branchId: 'da1a0698-6d91-4365-846d-2c467f827611',
      branchMappingLogic: 'true',
    },
  ],
  version: 0,
};

// Double stringify to get the escaped JSON string
console.log(JSON.stringify(JSON.stringify(branchMapping)));
