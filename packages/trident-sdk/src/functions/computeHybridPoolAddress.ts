import { JSBI, Token } from '@clonedex/core-sdk'
import { Fee } from '../enums/Fee'
import { computePoolInitCodeHash } from './computePoolInitCodeHash'
import { defaultAbiCoder } from '@ethersproject/abi'
import { getCreate2Address } from '@ethersproject/address'
import hybridPoolArtifact from '@sushiswap/trident/artifacts/contracts/pool/hybrid/HybridPool.sol/HybridPool.json'
import { keccak256 } from '@ethersproject/solidity'

export const computeHybridPoolAddress = ({
  factoryAddress,
  masterDeployer,
  tokenA,
  tokenB,
  fee,
  a,
}: {
  factoryAddress: string
  masterDeployer: string
  tokenA: Token
  tokenB: Token
  fee: Fee
  a: JSBI
}): string => {
  // does safety checks
  const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]

  const deployData = defaultAbiCoder.encode(
    ['address', 'address', 'uint256', 'uint256'],
    [...[token0.address, token1.address].sort(), fee, a]
  )

  // Compute init code hash based off the bytecode, deployData & masterDeployerAddress
  const HYBRID_POOL_INIT_CODE_HASH = computePoolInitCodeHash({
    creationCode: hybridPoolArtifact.bytecode,
    deployData,
    masterDeployerAddress: masterDeployer,
  })

  // Compute pool address
  return getCreate2Address(factoryAddress, keccak256(['bytes'], [deployData]), HYBRID_POOL_INIT_CODE_HASH)
}
