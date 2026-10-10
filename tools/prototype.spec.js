import {test,expect} from '@playwright/test';
const url='http://127.0.0.1:5175';
test.use({viewport:{width:1440,height:1000},channel:'chrome'});
test.setTimeout(120000);
test('desktop workflow, boundary cases, persistence and display',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
 await expect(page).toHaveTitle(/益望/);await expect(page.locator('canvas')).toHaveCount(1);
 await expect(page.getByText('拖动旋转 · 滚轮 / 双指缩放',{exact:true})).toBeVisible({timeout:45000});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:'preview/prototype-overview.png',fullPage:true});
 await page.getByRole('button',{name:'生态沙盘',exact:true}).click();
 await expect(page.getByRole('button',{name:'提交复核',exact:true})).toBeDisabled();
 await page.getByRole('slider',{name:'预算上限'}).fill('1000');await page.getByRole('button',{name:'运行情景推演'}).click();await expect(page.getByText('方案超出预算，请调整措施或预算')).toBeVisible();
 await page.getByRole('slider',{name:'预算上限'}).fill('10000');await page.getByRole('button',{name:'运行情景推演'}).click();await expect(page.getByRole('button',{name:'提交复核',exact:true})).toBeEnabled();
 await page.getByRole('slider',{name:'推演天数'}).fill('21');await expect(page.getByRole('button',{name:'提交复核',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'运行情景推演'}).click();await page.getByRole('button',{name:'双方案对比'}).click();await expect(page.locator('.eco-scene canvas')).toHaveCount(2);
 await page.screenshot({path:'preview/prototype-sandbox.png',fullPage:true});
 await page.getByRole('button',{name:'提交复核',exact:true}).click();await page.getByRole('button',{name:'确认提交'}).click();
 for(const action of ['复核通过','审批通过','提交执行反馈','完成评估']){await expect(page.getByRole('button',{name:action,exact:true})).toBeDisabled();await page.locator('textarea').fill('自动测试：本地模拟处理意见');await page.getByRole('button',{name:action,exact:true}).click()}
 await expect(page.getByText('已归档',{exact:true})).toBeVisible();await page.reload();await page.getByRole('button',{name:'行动中心',exact:true}).click();await expect(page.getByText('已归档',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'报告中心',exact:true}).click();const download=page.waitForEvent('download');await page.getByRole('button',{name:'导出文本报告'}).click();expect((await download).suggestedFilename()).toContain('模拟报告');
 await page.getByRole('button',{name:'独立大屏',exact:true}).click();await expect(page.getByRole('heading',{name:'让保护，看得见。'})).toBeVisible();await page.screenshot({path:'preview/prototype-display.png',fullPage:true});await page.getByRole('button',{name:'方案推演',exact:true}).click();await expect(page.locator('.eco-scene canvas')).toHaveCount(1);await page.getByRole('button',{name:'治理成效',exact:true}).click();await expect(page.getByRole('heading',{name:'1 项生态行动'})).toBeVisible();
 await page.getByRole('button',{name:'返回工作台'}).click();await page.getByRole('textbox',{name:'生态指令'}).fill('查看证据');await page.getByRole('button',{name:'执行指令'}).click();await expect(page.getByRole('heading',{name:'每个判断，都有来处。'})).toBeVisible();
 expect(errors).toEqual([]);
});
test('local models, unsupported format and narrow viewport',async({page})=>{
 await page.goto(url);await page.getByRole('button',{name:'生物档案',exact:true}).click();
 for(const name of ['青蛙','啄木鸟']){await page.locator('.species-tabs button').filter({hasText:name}).click();await expect(page.getByText('拖动旋转 · 滚轮 / 双指缩放',{exact:true})).toBeVisible({timeout:45000});}
 await page.locator('.species-tabs button').filter({hasText:'七星瓢虫'}).click();await expect(page.getByRole('status')).toContainText('max',{timeout:15000});
 await page.setViewportSize({width:1024,height:768});await page.getByRole('button',{name:'区域总览',exact:true}).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
});
