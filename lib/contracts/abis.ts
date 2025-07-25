// ERC20 Token ABI (Standard functions needed for USDC, USDT, NOMA)
export const ERC20_ABI = [
  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  
  // Write functions
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
]

// Token Sale Contract ABI
export const TOKEN_SALE_ABI = [
  // Read functions
  'function tokenPrice() view returns (uint256)',
  'function token() view returns (address)',
  'function owner() view returns (address)',
  'function saleActive() view returns (bool)',
  'function minPurchase() view returns (uint256)',
  'function maxPurchase() view returns (uint256)',
  'function totalSold() view returns (uint256)',
  'function userPurchases(address user) view returns (uint256)',
  
  // Write functions
  'function buyTokensWithBNB() payable',
  'function buyTokensWithToken(address tokenAddress, uint256 amount)',
  'function setSaleActive(bool active)',
  'function setTokenPrice(uint256 price)',
  'function withdrawBNB()',
  'function withdrawTokens(address tokenAddress)',
  'function emergencyWithdraw()',
  
  // Events
  'event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost, address paymentToken)',
  'event SaleStatusChanged(bool active)',
  'event PriceUpdated(uint256 newPrice)',
  'event Withdrawal(address indexed token, uint256 amount)'
]

// NOMA Token ABI (extends ERC20 with additional features)
export const NOMA_TOKEN_ABI = [
  ...ERC20_ABI,
  
  // Additional NOMA-specific functions
  'function mint(address to, uint256 amount)',
  'function burn(uint256 amount)',
  'function burnFrom(address account, uint256 amount)',
  'function pause()',
  'function unpause()',
  'function paused() view returns (bool)',
  
  // Events
  'event Paused(address account)',
  'event Unpaused(address account)'
]

// Multicall ABI for batch operations
export const MULTICALL_ABI = [
  'function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)',
  'function getEthBalance(address addr) view returns (uint256 balance)',
  'function getBlockHash(uint256 blockNumber) view returns (bytes32 blockHash)',
  'function getLastBlockHash() view returns (bytes32 blockHash)',
  'function getCurrentBlockTimestamp() view returns (uint256 timestamp)',
  'function getCurrentBlockDifficulty() view returns (uint256 difficulty)',
  'function getCurrentBlockGasLimit() view returns (uint256 gaslimit)',
  'function getCurrentBlockCoinbase() view returns (address coinbase)'
]
