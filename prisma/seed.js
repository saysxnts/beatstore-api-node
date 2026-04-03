/**
 * prisma/seed.js
 * Execute: npm run db:seed
 *
 * IAAAANN: adicione o iaaaann.wav na pasta beats/wav do Drive
 * e substitua o campo wavDriveId abaixo pelo ID correto.
 */
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ID do PDF de licença único (Beat_Usage_License_saysxnts.pdf)
// Substitua pelo ID real do seu arquivo no Drive
const LICENSE_DRIVE_ID = "1Xdb8kI-LP-0i4wNw5FV2_pF_93bzqj1k";

const beats = [
  {
    name: "2BRASS",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "14Y6DBIH5zeo01_0THGPBRoc1ZUHDp7la",
    audioPreviewDriveId: "12kAm4DDnxm-V82HLRKgOSmi5CtP_BJlO",
    wavDriveId:          "1MJu0u63Eyz0ZThxu40fD1bC0nb7lX_zy",
  },
  {
    name: "EVIL",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1NerX5ksFHOaK8PRmTYjzLYJyOE7aKJIJ",
    audioPreviewDriveId: "13ZctX7zG-LA15RhbFjZLQt-rguTzoBvp",
    wavDriveId:          "17KbjZSvgdXZ2h9GlqgAg_x_o77A5pXTP",
  },
  {
    name: "FAZO",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1bzOwh4mqMk1W3kXKbCA1PJWlROUD9TUS",
    audioPreviewDriveId: "13rOwGsoWJTDlYtXt62B6LAMjc7GVBUpt",
    wavDriveId:          "1wYVkZcxMGaH19wPLnec00IU21ARtjxMP",
  },
  {
    name: "FLO",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1uiFOtF8QF_muxDTnH1M38NUtdHRrj1wW",
    audioPreviewDriveId: "15uQmZ2Ht8SuVX2_gAX55q_FWatRYfwRl",
    wavDriveId:          "1TQ4WwhFz9VAUjJe73jf3iyI1xZrQ0gaM",
  },
  {
    name: "GTA",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1EWQH9zU7miAmie7kjrooDfaOFSYbZ5Yu",
    audioPreviewDriveId: "17iwfgDGVlU_jzJVztiZvyMvzbrlR5DBZ",
    wavDriveId:          "1fWkgPYEv2a1ZulSfYUt_UK-Zc6wVs6ik",
  },
  {
    name: "HIGH-GLO",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1hWuZ_ft5Osub_ze6SIZxaSD2hFmT_O_l",
    audioPreviewDriveId: "1DY-0Fl5ShnVCFimYqI9kiMEuJOtjEzMD",
    wavDriveId:          "1ac3z7-BVQ7S7ScHGQdNYpyPLbdunDSXo",
  },
  {
    name: "IAAAANN",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "11CuDu_xACEmupzAcM5L-BH03XnquZra_",
    audioPreviewDriveId: "1GTzewr6Gf-VYUeM7YVc-9zqYZMkQQXih",
    // TODO: adicione iaaaann.wav na pasta beats/wav do Drive
    wavDriveId:          "ADICIONE_O_ID_DO_IAAAANN_WAV",
  },
  {
    name: "IAN-X-GLO",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1_xZPFYDoMc1HT0QE4Z7eslzy0rz_R5wz",
    audioPreviewDriveId: "1IpGhG1dX6mRdC9wzmBw6ENoEonPEjYW1",
    wavDriveId:          "1p8I9EDR0h2AwynlV3L_OA_ahLvWa7_kn",
  },
  {
    name: "JERSEY",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1nEh5YlBF0AAVesE4dbdB_EJlVdO9ZF7b",
    audioPreviewDriveId: "1KdcgyB1BJsr5R7PbtQnCMHvPPjHObQVx",
    wavDriveId:          "1mEAbf12edXndLTAYchKDoai0KYaVBTd3",
  },
  {
    name: "LOCKED",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1OkX7_DquL-3KOT6AnLlkgjjmuffUuW3a",
    audioPreviewDriveId: "1aRThaKrX2U70CemPIim-gzVbSAyRu08C",
    wavDriveId:          "1DMk3v58ck_pb_dJe9ATnlpt6mCJscSF7",
  },
  {
    name: "NYGLO",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1Orp6zdWgZRv2oyVmShRB_zqt9-DGF0Jr",
    audioPreviewDriveId: "1ahSF0V28trbzN2fFS9mhjLqXftAyUkGa",
    wavDriveId:          "1yDYBC3UyuYbOcuFsgg1UuqpzPUzdqsyp",
  },
  {
    name: "RAIN",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1zt5WUqj8-0zQ2iLgSP3i5U3JtT12WzYY",
    audioPreviewDriveId: "1bqhkYAoqWoLPUyEOTOw9BPc4MswhD-jh",
    wavDriveId:          "1f6QLMaqYKIqvbkrtR81wvjE3b6btSjmb",
  },
  {
    name: "RICH",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1VElpBF_tKb4iKLAg0xrG8K9TAnc75nv2",
    audioPreviewDriveId: "1oTJ3JyIUjuCrwGsvO1MUnfj3bQZEFCwp",
    wavDriveId:          "1l4AK4ceXwXbXTZABGaAfbSGuPv1YBJcA",
  },
  {
    name: "TRA",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1JTgiZAdq0y2iRcb6GXhxOcPkRaYkTcE8",
    audioPreviewDriveId: "1osCzijsYnzSMsQZmlK2eO-g5XkoM-e0x",
    wavDriveId:          "1XYhVn9OoNYoUrUGhTLdOy62L_PvHen6F",
  },
  {
    name: "TWKT",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1JGIJxkFVQsdzGS01KwsDXyQt3dNyOgsu",
    audioPreviewDriveId: "1qL2l71Eb1SmjFgBS4xosuMqBc_QUeFo9",
    wavDriveId:          "1zkaXl-OFbxrd7cWO4lVF5vp7BE4o09tp",
  },
  {
    name: "TYPE",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1Tk1MhwxoVnP9dMT7QdNtuFWgR9I2fEdk",
    audioPreviewDriveId: "1sTsfp8HSSFreya7nD9YRdLHhxRoUZDjb",
    wavDriveId:          "1BA1ALQadnI-uwEABI7q6eplM4NkWTQAA",
  },
  {
    name: "WAREADY",
    price: 19.95,
    tags: ["Glo", "Trap"],
    coverDriveId:        "1N1VF4RN3t7H8yuFrh_PNK48NkmFtU42N",
    audioPreviewDriveId: "1t180cwrTaSyrcGz4oQJauI82evy0WC88",
    wavDriveId:          "16CE6zQYWUm09qghlY4onYMAtzkrxyKYW",
  },
];

async function main() {
  console.log("Limpando beats existentes...");
  await prisma.beat.deleteMany();

  console.log("Inserindo beats...");
  for (const beat of beats) {
    await prisma.beat.create({ data: { ...beat, producer: "saysxnts" } });
    console.log(`  ✓ ${beat.name}`);
  }

  console.log(`\n${beats.length} beats inseridos com sucesso.`);
  console.log(`\nLembre-se de adicionar o LICENSE_DRIVE_ID no .env:`);
  console.log(`LICENSE_DRIVE_ID=${LICENSE_DRIVE_ID}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());