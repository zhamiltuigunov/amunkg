import fs from 'fs';
let content = fs.readFileSync('src/components/UserCabinet.tsx', 'utf8');

content = content.replace(/req\.confData\.name/g, 'req.confData?.name');
content = content.replace(/req\.confData\.nameEn/g, 'req.confData?.nameEn');
content = content.replace(/req\.confData\.org/g, 'req.confData?.org');
content = content.replace(/req\.confData\.orgEn/g, 'req.confData?.orgEn');
content = content.replace(/req\.confData\.location/g, 'req.confData?.location');
content = content.replace(/req\.confData\.locationEn/g, 'req.confData?.locationEn');
content = content.replace(/req\.confData\.type/g, 'req.confData?.type');
content = content.replace(/req\.confData\.registrationFee/g, 'req.confData?.registrationFee');
content = content.replace(/req\.confData\.committees/g, 'req.confData?.committees');
content = content.replace(/req\.confData\.startDate/g, 'req.confData?.startDate');
content = content.replace(/req\.confData\.endDate/g, 'req.confData?.endDate');
content = content.replace(/req\.confData\.description/g, 'req.confData?.description');
content = content.replace(/req\.confData\.descriptionEn/g, 'req.confData?.descriptionEn');
content = content.replace(/targetReq\.confData\.name/g, 'targetReq.confData?.name');
content = content.replace(/targetReq\.confData\.nameEn/g, 'targetReq.confData?.nameEn');
content = content.replace(/confToDelete\.name/g, 'confToDelete?.name');
content = content.replace(/confToDelete\.nameEn/g, 'confToDelete?.nameEn');
content = content.replace(/existingConf\.name/g, 'existingConf?.name');
content = content.replace(/existingConf\.nameEn/g, 'existingConf?.nameEn');
content = content.replace(/twoFactorPendingUser\.name/g, 'twoFactorPendingUser?.name');
content = content.replace(/matched\.name/g, 'matched?.name');
content = content.replace(/newUser\.name/g, 'newUser?.name');
content = content.replace(/user\.name/g, 'user?.name');

fs.writeFileSync('src/components/UserCabinet.tsx', content);

let confContent = fs.readFileSync('src/components/ConferenceDirectory.tsx', 'utf8');
confContent = confContent.replace(/selectedConf\.name/g, 'selectedConf?.name');
confContent = confContent.replace(/selectedConf\.nameEn/g, 'selectedConf?.nameEn');
confContent = confContent.replace(/selectedConf\.type/g, 'selectedConf?.type');
confContent = confContent.replace(/selectedConf\.org/g, 'selectedConf?.org');

fs.writeFileSync('src/components/ConferenceDirectory.tsx', confContent);
console.log('Fixed UserCabinet');
