const descriptionApiUrlBase = 'https://api.github.com/repos/Database-Clarity/Live-Clarity-Database/contents/',
   descriptionRawUrlBase = 'https://raw.githubusercontent.com/Database-Clarity/Live-Clarity-Database/',
   dataGeneratorApiUrlBase = 'https://api.github.com/repos/Database-Clarity/Description-data-generator/contents/',
   dataGeneratorRawUrlBase = 'https://raw.githubusercontent.com/Database-Clarity/Description-data-generator/'

const useTestData = false

export const apiUrlsV2 = {
   live: {
      url: descriptionApiUrlBase + 'liveDescriptions.json',
      branch: useTestData ? 'testConverter' : 'converter',
      raw: useTestData
         ? descriptionRawUrlBase + 'testConverter/' + 'liveDescriptions.json'
         : descriptionRawUrlBase + 'converter/' + 'liveDescriptions.json'
   },
   intermediate: {
      url: descriptionApiUrlBase + 'intermediateDescriptions.json',
      branch: useTestData ? 'test' : 'intermediate',
      raw: useTestData
         ? descriptionRawUrlBase + 'test/' + 'intermediateDescriptions.json'
         : descriptionRawUrlBase + 'intermediate/' + 'intermediateDescriptions.json'
   },
   dataGenerator: {
      url: dataGeneratorApiUrlBase + '/templates/descriptions.json',
      branch: 'main',
      raw: dataGeneratorRawUrlBase + 'main/' + '/templates/descriptions.json'
   }
} as const
