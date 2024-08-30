const grpc = require('@grpc/grpc-js')
const { connect, signers } = require('@hyperledger/fabric-gateway')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs').promises

const channelName = envOrDefault('CHANNEL_NAME', 'mychannel')
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'chaincode')
const mspId = envOrDefault('MSP_ID', 'Org1MSP')

const cryptoPath = path.resolve(__dirname, '..', '..', 'blockchain_files')
const keyDirectoryPath = path.resolve(cryptoPath, 'keystore')
const certDirectoryPath = path.resolve(cryptoPath, 'signcerts')
const tlsCertPath = path.resolve(cryptoPath, 'ca.crt')

const peerEndpoint = process.env.BLOCKCHAIN_URL
const peerHostAlias = 'peer0.org1.example.com'

class Connection {
  static contract
  init() {
    initFabric()
  }
}

async function initFabric() {
  const client = await newGrpcConnection()
  const identity = await newIdentity()
  const signer = await newSigner()

  console.log(`Using identity: ${identity.mspId}`)

  const gateway = connect({
    client,
    identity,
    signer,
    evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
    endorseOptions: () => ({ deadline: Date.now() + 15000 }),
    submitOptions: () => ({ deadline: Date.now() + 5000 }),
    commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
  })

  try {
    const network = gateway.getNetwork(channelName)
    const contract = network.getContract(chaincodeName)
    Connection.contract = contract

    console.log('Successfully connected to the network and contract.')
  } catch (e) {
    if (e instanceof Error) {
      console.error('Error during Fabric initialization:', e.message)
    } else {
      console.error('Unknown error during Fabric initialization:', e)
    }
  } finally {
    console.log('Finished Fabric initialization')
  }
}

async function newGrpcConnection() {
  const tlsRootCert = await fs.readFile(tlsCertPath)
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert)
  return new grpc.Client(peerEndpoint, tlsCredentials, {
    'grpc.ssl_target_name_override': peerHostAlias,
  })
}

async function newIdentity() {
  const certPath = await getFirstDirFileName(certDirectoryPath)
  const credentials = await fs.readFile(certPath)
  console.log(`Loaded identity credentials from ${certPath}`)
  return { mspId, credentials }
}

async function newSigner() {
  const keyPath = await getFirstDirFileName(keyDirectoryPath)
  const privateKeyPem = await fs.readFile(keyPath)
  const privateKey = crypto.createPrivateKey(privateKeyPem)
  console.log(`Loaded private key from ${keyPath}`)
  return signers.newPrivateKeySigner(privateKey)
}

async function getFirstDirFileName(dirPath) {
  const files = await fs.readdir(dirPath)
  if (files.length === 0) {
    throw new Error(`No files found in directory: ${dirPath}`)
  }
  return path.join(dirPath, files[0])
}

function envOrDefault(key, defaultValue) {
  return process.env[key] || defaultValue
}

module.exports = { Connection }
