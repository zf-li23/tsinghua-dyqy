export interface ArchiveCategory {
  key: string
  title: string
  description: string
  files: string[]
}

export interface YearArchive {
  year: string
  categories: ArchiveCategory[]
}

export const yearlyArchives: YearArchive[] = [
  {
    year: '2025',
    categories: [
      {
        key: 'academic',
        title: '学术报告',
        description: '生态与人文双线报告，聚焦鸟塘经济与自然环境调研。',
        files: [
          'yearly-archives/学术报告/2025/报告-人文部分：基于盈江县犀鸟谷和保山市百花岭两地鸟塘经济发展现状探究盈江县犀鸟谷鸟塘经济国企介入的可行性.docx',
          'yearly-archives/学术报告/2025/报告-生态部分：盈江县犀鸟谷和保山市百花岭两地鸟塘周边自然环境调研报告.docx',
        ],
      },
      {
        key: 'summary',
        title: '成果总结报告',
        description: '年度必交成果，沉淀调研方法、组织经验与项目产出。',
        files: [
          'yearly-archives/成果总结报告/2025/【必交项】成果总结报告.docx',
          'yearly-archives/成果总结报告/2025/【必交项】成果总结报告.pdf',
        ],
      },
      {
        key: 'photo',
        title: '摄影作品',
        description: '记录实践现场、人物访谈与鸟类生态瞬间。',
        files: [
          'yearly-archives/摄影作品/2025/愤怒的血雀_保山百花岭_于乐添.png',
          'yearly-archives/摄影作品/2025/愿作犀鸟不羡仙_盈江犀鸟谷_于乐添.png',
          'yearly-archives/摄影作品/2025/眠枝鸦雀不回头_盈江红崩河鸟塘_于乐添.jpg',
          'yearly-archives/摄影作品/2025/观鸟途中的一瞥_保山百花岭_于乐添.jpg',
          'yearly-archives/摄影作品/2025/鸟塘观鸟_盈江犀鸟谷_于乐添.JPG',
        ],
      },
      {
        key: 'creative',
        title: '文创产品',
        description: '围绕滇西鸟类主题的明信片与周边设计。',
        files: [
          'yearly-archives/文创产品/2025/手绘滇西鸟类明信片实物图.jpg',
          'yearly-archives/文创产品/2025/手绘滇西鸟类明信片扫描图.pdf',
          'yearly-archives/文创产品/2025/犀鸟钥匙扣设计稿.jpg',
          'yearly-archives/文创产品/2025/相关说明.docx',
        ],
      },
    ],
  },
  {
    year: '2024',
    categories: [
      {
        key: 'academic',
        title: '学术报告',
        description: '聚焦盈江文旅发展路径与共同富裕议题。',
        files: [
          'yearly-archives/学术报告/2024/盈江县文旅发展模式与实现路径.docx',
          'yearly-archives/学术报告/2024/盈江旅游产业现状调研报告0303.docx',
          'yearly-archives/学术报告/2024/绿水青山就是金山银山”理念引领共同富裕0227.docx',
        ],
      },
      {
        key: 'summary',
        title: '成果总结报告',
        description: '年度总结文档，覆盖调研流程、访谈反馈与传播成果。',
        files: [
          'yearly-archives/成果总结报告/2024/【必交项】成果总结报告.docx',
          'yearly-archives/成果总结报告/2024/【必交项】成果总结报告.pdf',
        ],
      },
      {
        key: 'photo',
        title: '摄影作品',
        description: '支队调研纪实、座谈、边境行走与夜间活动记录。',
        files: [
          'yearly-archives/摄影作品/2024/支队在铜壁关合照.jpg',
          'yearly-archives/摄影作品/2024/与盈江县座谈会.jpg',
          'yearly-archives/摄影作品/2024/支队调研纪实.jpg',
          'yearly-archives/摄影作品/2024/支队难得的篝火晚会.jpg',
        ],
      },
      {
        key: 'creative',
        title: '文创产品',
        description: '头像设计与红包封面方案，强化在地传播视觉。',
        files: [
          'yearly-archives/文创产品/2024/为当地设计的宣发头像/终稿.jpg',
          'yearly-archives/文创产品/2024/红包封面壹/封面图片.jpg',
          'yearly-archives/文创产品/2024/红包封面贰/封面图片.png',
          'yearly-archives/文创产品/2024/红包封面叁/封面图片.jpg',
        ],
      },
    ],
  },
  {
    year: '2023',
    categories: [
      {
        key: 'academic',
        title: '学术报告',
        description: '围绕石梯村与百花岭鸟塘鸟种、频次及影响因素分析。',
        files: [
          'yearly-archives/学术报告/2023/盈江县石梯村与保山市百花岭村鸟塘鸟种、鸟类出现频次及其影响因素分析.pdf',
          'yearly-archives/学术报告/2023/盈江县石梯村与保山市百花岭村鸟塘鸟种、鸟类出现频次及其影响因素分析.docx',
        ],
      },
      {
        key: 'summary',
        title: '成果总结报告',
        description: '标准化结项文档，沉淀支队年度核心成果。',
        files: [
          'yearly-archives/成果总结报告/2023/【必交项】成果总结报告.docx',
          'yearly-archives/成果总结报告/2023/【必交项】成果总结报告.pdf',
        ],
      },
      {
        key: 'photo',
        title: '摄影作品',
        description: '上石梯与百花岭的鸟类影像与生态瞬间。',
        files: [
          'yearly-archives/摄影作品/2023/两种相思鸟_上石梯_王啸.jpg',
          'yearly-archives/摄影作品/2023/小鸟的凝视_百花岭村_陈功.JPG',
          'yearly-archives/摄影作品/2023/金翅噪鹛_百花岭村_白彬惠.JPG',
          'yearly-archives/摄影作品/2023/黑喉红臀鹎发射！_上石梯_陈功.PNG',
        ],
      },
      {
        key: 'creative',
        title: '文创产品',
        description: '鸟类主题服饰、红包封面与图像文创。',
        files: [
          'yearly-archives/文创产品/2023/白冠噪鹛衬衫.jpg',
          'yearly-archives/文创产品/2023/银胸丝冠鸟印象短裤.jpg',
          'yearly-archives/文创产品/2023/红包封面.png',
          'yearly-archives/文创产品/2023/文创产品说明.pdf',
        ],
      },
    ],
  },
]
