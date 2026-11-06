import { test, expect } from '@playwright/test';

for (const width of [320, 390, 768, 1440]) {
  test(`hero is readable and interactive at ${width}px`, async ({ page }) => {
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/');
    await page.locator('.language-switch').selectOption('es');
    await page.setViewportSize({width,height:1000});
    const title=page.locator('#hero-title');
    await expect(title).toHaveText('Seguridad paratu empresa.');
    const dimensions=await title.evaluate(el=>{const box=el.getBoundingClientRect();const style=getComputedStyle(el);return {top:box.top,lines:box.height/parseFloat(style.lineHeight)};});
    expect(dimensions.top).toBeGreaterThan(75);
    expect(dimensions.lines).toBeLessThan(2.1);
    expect(await page.locator('.security-preview').count()).toBe(0);
    const choices=page.getByRole('group',{name:'Explorar visión del producto'});
    await choices.getByRole('button',{name:'Cuentas',exact:true}).click();
    await expect(choices.getByRole('button',{name:'Cuentas',exact:true})).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('.business-explanation')).toContainText('qué accesos necesitan atención');
    await choices.getByRole('button',{name:'Dominio',exact:true}).click();
    await expect(page.locator('.business-explanation')).toContainText('Disponible: chequeo público');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:`/tmp/cispar-astra-final-${width}.png`});
    await page.locator('.centinela-hero-actions').getByRole('button',{name:'Revisar mi dominio'}).click();
    await expect(page.locator('#assessment')).toBeInViewport();
  });
}

test('English hero retains product scope and correct contact destination',async({page})=>{
  await page.goto('/');await page.locator('.language-switch').selectOption('en');
  await expect(page.locator('#hero-title')).toContainText('Security for');
  await page.getByRole('group',{name:'Explore the product vision'}).getByRole('button',{name:'Domain',exact:true}).click();
  await expect(page.locator('.business-explanation')).toContainText('Available: public checks');
  await page.locator('.centinela-hero-actions').getByRole('link',{name:'Talk to CISPAR'}).click();
  await expect(page.locator('.contact-form')).toBeVisible();
});
