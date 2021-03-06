const k8Client = require("kubernetes-client").Client;

function getNodeField(node, kind, field, RED, msg) {
  switch (kind) {
    case "flow": {
      return node.context().flow.get(field);
    }
    case "global": {
      return node.context().global.get(field);
    }
    case "num": {
      return parseInt(field, 10);
    }
    case "msg": {
      return RED.util.getMessageProperty(msg, field);
    }
    case "bool": {
      return JSON.parse(field);
    }
    default: {
      return field;
    }
  }
}

function getNodeConfig(node, RED, msg) {
  // If we have filled our msg with the server configuration
  if (msg.openshift && msg.openshift.config) {
    return msg.openshift.config;
  }
  // Get config node values
  const {
    name,
    host,
    port,
    insecure,
    token,
    nameFieldType,
    hostFieldType,
    portFieldType,
    insecureFieldType,
    tokenFieldType
  } = node.config;
  return {
    name: getNodeField(node, nameFieldType, name, RED, msg),
    host: getNodeField(node, hostFieldType, host, RED, msg),
    port: getNodeField(node, portFieldType, port, RED, msg),
    insecure: getNodeField(node, insecureFieldType, insecure, RED, msg),
    token: getNodeField(node, tokenFieldType, token, RED, msg)
  };
}

function getK8Client(node, RED, msg) {
  const { host, port, insecure, token } = getNodeConfig(node, RED, msg);
  return new k8Client({
    config: {
      url: `https://${host}:${port}`,
      auth: {
        bearer: token
      },
      insecureSkipTlsVerify: insecure
    }
  }).loadSpec();
}

module.exports = {
  getNodeField,
  getK8Client
};
