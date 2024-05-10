import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // const deployedConfidentialERC1155 = await deploy("ConfidentialERC1155", {
  //   from: deployer,
  //   args: ["Uri"],
  //   log: true,
  // });

  // console.log(`ConfidentialERC1155 contract: `, deployedConfidentialERC1155.address);

  const deployedLightConfidentialToken = await deploy("LightConfidentialToken", { from: deployer, log: true });
  console.log(`LightConfidentialToken contract: `, deployedLightConfidentialToken.address);

  // const deployedSimpleStorage = await deploy("SimpleStorage", { from: deployer, log: true });
  // console.log(`SimpleStorage contract: `, deployedSimpleStorage.address);
};
export default func;
func.id = "deploy_confidentialERC1155"; // id required to prevent reexecution
func.tags = ["ConfidentialERC1155"];
